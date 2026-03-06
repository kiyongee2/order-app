require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트 임포트 (추후 추가)
// const menuRouter = require('./routes/menus');
// const orderRouter = require('./routes/orders');
// const adminRouter = require('./routes/admin');

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: 'Coffee Order App Backend Server',
    version: '1.0.0',
    status: 'running'
  });
});

// 헬스 체크
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running'
  });
});

// 라우트 설정 (추후 추가)
// app.use('/api/menus', menuRouter);
// app.use('/api/orders', orderRouter);
// app.use('/api/admin', adminRouter);

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Not Found'
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
