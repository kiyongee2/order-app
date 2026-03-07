const pool = require('../config/database');

// 재고 조회
const getInventory = async (req, res) => {
  try {
    const query = `
      SELECT id, name, price, stock,
        CASE 
          WHEN stock = 0 THEN '품절'
          WHEN stock < 5 THEN '주의'
          ELSE '정상'
        END as status
      FROM menus
      ORDER BY id
    `;
    const result = await pool.query(query);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({
      success: false,
      message: '재고 정보를 불러올 수 없습니다.'
    });
  }
};

// 재고 업데이트
const updateInventory = async (req, res) => {
  try {
    const { menuId } = req.params;
    const { stock } = req.body;

    // 유효성 검사
    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({
        success: false,
        message: '재고 수량은 음수가 될 수 없습니다.'
      });
    }

    const query = 'UPDATE menus SET stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, stock, updated_at';
    const result = await pool.query(query, [stock, menuId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '해당 메뉴를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '재고가 업데이트되었습니다.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({
      success: false,
      message: '재고 업데이트 중 오류가 발생했습니다.'
    });
  }
};

module.exports = {
  getInventory,
  updateInventory
};
