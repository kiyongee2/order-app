const express = require('express');
const router = express.Router();
const { getMenus, getMenuById } = require('../controllers/menuController');

// 메뉴 목록 조회
router.get('/', getMenus);

// 단일 메뉴 조회
router.get('/:id', getMenuById);

module.exports = router;
