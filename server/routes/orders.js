const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getOrders,
  updateOrderStatus
} = require('../controllers/orderController');

// 주문 생성
router.post('/', createOrder);

// 주문 목록 조회 (관리자용)
router.get('/', getOrders);

// 주문 조회
router.get('/:id', getOrderById);

// 주문 상태 변경
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
