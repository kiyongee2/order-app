const pool = require('../config/database');

// 메뉴 목록 조회 (옵션 포함)
const getMenus = async (req, res) => {
  try {
    const menusQuery = 'SELECT * FROM menus ORDER BY id';
    const menusResult = await pool.query(menusQuery);
    
    const menus = menusResult.rows;
    
    // 각 메뉴의 옵션 조회
    const menusWithOptions = await Promise.all(
      menus.map(async (menu) => {
        const optionsQuery = 'SELECT id, name, price FROM options WHERE menu_id = $1 ORDER BY id';
        const optionsResult = await pool.query(optionsQuery, [menu.id]);
        return {
          ...menu,
          options: optionsResult.rows
        };
      })
    );

    res.json({
      success: true,
      data: menusWithOptions
    });
  } catch (error) {
    console.error('Error fetching menus:', error);
    res.status(500).json({
      success: false,
      message: '메뉴 목록을 불러올 수 없습니다.'
    });
  }
};

// 단일 메뉴 조회
const getMenuById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const menuQuery = 'SELECT * FROM menus WHERE id = $1';
    const menuResult = await pool.query(menuQuery, [id]);
    
    if (menuResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '해당 메뉴를 찾을 수 없습니다.'
      });
    }

    const menu = menuResult.rows[0];
    
    const optionsQuery = 'SELECT id, name, price FROM options WHERE menu_id = $1 ORDER BY id';
    const optionsResult = await pool.query(optionsQuery, [id]);

    res.json({
      success: true,
      data: {
        ...menu,
        options: optionsResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({
      success: false,
      message: '메뉴를 불러올 수 없습니다.'
    });
  }
};

module.exports = {
  getMenus,
  getMenuById
};
