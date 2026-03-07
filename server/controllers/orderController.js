const pool = require('../config/database');

// 주문 생성
const createOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    const { items, notes } = req.body;

    // 유효성 검사
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: '주문 정보가 유효하지 않습니다.',
        errors: [
          {
            field: 'items',
            message: '최소 1개 이상의 항목이 필요합니다.'
          }
        ]
      });
    }

    await client.query('BEGIN');

    // 재고 확인 및 가격 계산
    let totalPrice = 0;
    const orderItemsData = [];

    for (const item of items) {
      const { menuId, quantity, options } = item;

      // 메뉴 정보 조회 및 재고 확인
      const menuQuery = 'SELECT id, name, price, stock FROM menus WHERE id = $1';
      const menuResult = await client.query(menuQuery, [menuId]);

      if (menuResult.rows.length === 0) {
        throw new Error(`메뉴 ID ${menuId}를 찾을 수 없습니다.`);
      }

      const menu = menuResult.rows[0];

      // 재고 확인
      if (menu.stock < quantity) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          success: false,
          message: '재고가 부족합니다.',
          data: {
            menuId: menu.id,
            menuName: menu.name,
            requestedQuantity: quantity,
            availableStock: menu.stock
          }
        });
      }

      // 아이템 가격 계산
      let itemPrice = menu.price * quantity;
      const optionsData = [];

      if (options && options.length > 0) {
        for (const optionId of options) {
          const optionQuery = 'SELECT id, name, price FROM options WHERE id = $1';
          const optionResult = await client.query(optionQuery, [optionId]);

          if (optionResult.rows.length > 0) {
            const option = optionResult.rows[0];
            itemPrice += option.price * quantity;
            optionsData.push(option);
          }
        }
      }

      totalPrice += itemPrice;
      orderItemsData.push({
        menuId: menu.id,
        menuName: menu.name,
        quantity,
        menuPrice: menu.price,
        itemPrice,
        options: optionsData
      });
    }

    // 주문 생성
    const orderQuery = 'INSERT INTO orders (total_price, notes, status) VALUES ($1, $2, $3) RETURNING id, status, created_at, updated_at';
    const orderResult = await client.query(orderQuery, [totalPrice, notes || null, 'received']);
    const orderId = orderResult.rows[0].id;

    // 주문 항목 및 옵션 추가
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemData = orderItemsData[i];

      // 재고 차감
      const updateStockQuery = 'UPDATE menus SET stock = stock - $1 WHERE id = $2';
      await client.query(updateStockQuery, [item.quantity, item.menuId]);

      // 주문 항목 추가
      const orderItemQuery = 'INSERT INTO order_items (order_id, menu_id, quantity, unit_price) VALUES ($1, $2, $3, $4) RETURNING id';
      const orderItemResult = await client.query(orderItemQuery, [orderId, item.menuId, item.quantity, itemData.itemPrice]);
      const orderItemId = orderItemResult.rows[0].id;

      // 주문 항목 옵션 추가
      if (item.options && item.options.length > 0) {
        for (const optionId of item.options) {
          const optionQuery = 'SELECT id, name, price FROM options WHERE id = $1';
          const optionResult = await client.query(optionQuery, [optionId]);

          if (optionResult.rows.length > 0) {
            const option = optionResult.rows[0];
            const insertOptionQuery = 'INSERT INTO order_item_options (order_item_id, option_id, option_name, option_price) VALUES ($1, $2, $3, $4)';
            await client.query(insertOptionQuery, [orderItemId, option.id, option.name, option.price]);
          }
        }
      }
    }

    await client.query('COMMIT');

    // 생성된 주문 정보 조회
    const fullOrderQuery = `
      SELECT o.id, o.status, o.total_price, o.notes, o.created_at, o.updated_at
      FROM orders o
      WHERE o.id = $1
    `;
    const fullOrderResult = await client.query(fullOrderQuery, [orderId]);

    res.status(201).json({
      success: true,
      message: '주문이 생성되었습니다.',
      data: fullOrderResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: '주문 생성 중 오류가 발생했습니다.',
      error: error.message
    });
  } finally {
    client.release();
  }
};

// 주문 조회
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const orderQuery = 'SELECT * FROM orders WHERE id = $1';
    const orderResult = await pool.query(orderQuery, [id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '해당 주문을 찾을 수 없습니다.'
      });
    }

    const order = orderResult.rows[0];

    // 주문 항목 조회
    const itemsQuery = `
      SELECT oi.id, oi.menu_id, m.name as menu_name, oi.quantity, oi.unit_price
      FROM order_items oi
      JOIN menus m ON oi.menu_id = m.id
      WHERE oi.order_id = $1
      ORDER BY oi.id
    `;
    const itemsResult = await pool.query(itemsQuery, [id]);

    // 각 항목의 옵션 조회
    const itemsWithOptions = await Promise.all(
      itemsResult.rows.map(async (item) => {
        const optionsQuery = `
          SELECT oio.id, oio.option_name as name, oio.option_price as price
          FROM order_item_options oio
          WHERE oio.order_item_id = $1
        `;
        const optionsResult = await pool.query(optionsQuery, [item.id]);
        return {
          ...item,
          options: optionsResult.rows
        };
      })
    );

    res.json({
      success: true,
      data: {
        ...order,
        items: itemsWithOptions
      }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: '주문을 불러올 수 없습니다.'
    });
  }
};

// 주문 목록 조회 (관리자용)
const getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM orders';
    const params = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);
    } else {
      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);
    }

    const result = await pool.query(query, params);

    // 전체 개수 조회
    let countQuery = 'SELECT COUNT(*) FROM orders';
    const countParams = [];
    if (status) {
      countQuery += ' WHERE status = $1';
      countParams.push(status);
    }
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        items: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: '주문 목록을 불러올 수 없습니다.'
    });
  }
};

// 주문 상태 변경
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['received', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 상태입니다.',
        validStatuses
      });
    }

    const query = 'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, status, updated_at';
    const result = await pool.query(query, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '해당 주문을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '주문 상태가 변경되었습니다.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: '주문 상태 변경 중 오류가 발생했습니다.'
    });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getOrders,
  updateOrderStatus
};
