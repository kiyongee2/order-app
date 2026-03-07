const express = require('express');
const router = express.Router();
const {
  getInventory,
  updateInventory
} = require('../controllers/adminController');

// 재고 조회
router.get('/inventory', getInventory);

// 재고 업데이트
router.patch('/inventory/:menuId', updateInventory);

module.exports = router;
