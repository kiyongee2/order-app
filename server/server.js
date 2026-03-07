require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/database');
const { readFileSync } = require('fs');
const { join } = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트 임포트
const menuRouter = require('./routes/menus');
const orderRouter = require('./routes/orders');
const adminRouter = require('./routes/admin');

// 데이터베이스 초기화 함수
const initializeDatabase = async () => {
  try {
    console.log('📋 SEED_DATA 환경변수:', process.env.SEED_DATA);
    
    // SEED_DATA가 true면 테이블 초기화
    if (process.env.SEED_DATA === 'true') {
      console.log('🔄 테이블 초기화 중...');
      // 각 DROP 문을 개별적으로 실행
      const tables = [
        'order_item_options',
        'order_items',
        'orders',
        'options',
        'menus'
      ];
      
      for (const table of tables) {
        try {
          await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
        } catch (err) {
          // 테이블이 없는 경우 무시
        }
      }
      console.log('✅ 기존 테이블이 삭제되었습니다.');
    }

    // 테이블 생성
    const createTablesSQL = readFileSync(join(__dirname, 'migrations', '001_create_tables.sql'), 'utf8');
    await pool.query(createTablesSQL);
    console.log('✅ 테이블이 준비되었습니다.');

    // 환경변수가 'true'일 때만 초기 데이터 삽입
    if (process.env.SEED_DATA === 'true') {
      const insertDataSQL = readFileSync(join(__dirname, 'migrations', '002_insert_initial_data.sql'), 'utf8');
      await pool.query(insertDataSQL);
      console.log('✅ 초기 데이터가 삽입되었습니다.');
    } else {
      console.log('⏭️  초기 데이터 삽입을 건너뛰었습니다. (SEED_DATA=true로 설정하면 활성화)');
    }
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 오류:', error.message);
  }
};

// 데이터베이스 연결 확인
pool.query('SELECT NOW()')
  .then(() => {
    console.log('✅ 데이터베이스 연결 성공');
    initializeDatabase();
  })
  .catch((error) => {
    console.error('❌ 데이터베이스 연결 실패:', error.message);
  });

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: 'Coffee Order App Backend Server',
    version: '1.0.0',
    status: 'running'
  });
});

// 라우트 설정
app.use('/api/menus', menuRouter);
app.use('/api/orders', orderRouter);
app.use('/api/admin', adminRouter);

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
