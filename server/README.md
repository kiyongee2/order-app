# Coffee Order App - Backend Server

Express.js 기반 커피 주문 애플리케이션 백엔드 서버

## 프로젝트 구조

```
server/
├── server.js              # 메인 서버 파일
├── package.json           # 의존성 관리
├── .env                   # 환경 변수 (로컬)
├── .env.example          # 환경 변수 예제
├── .gitignore            # git 무시 파일
├── README.md             # 이 파일
├── routes/               # API 라우트 (추후 추가)
│   ├── menus.js
│   ├── orders.js
│   └── admin.js
├── controllers/          # 비즈니스 로직 (추후 추가)
│   ├── menuController.js
│   ├── orderController.js
│   └── adminController.js
├── models/               # 데이터베이스 모델 (추후 추가)
│   ├── Menu.js
│   ├── Order.js
│   └── Option.js
├── config/               # 설정 파일 (추후 추가)
│   └── database.js
└── migrations/           # DB 마이그레이션 (추후 추가)
    ├── 001_create_tables.sql
    └── 002_insert_initial_data.sql
```

## 설치

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일에서 다음 정보를 수정하세요:

```env
PORT=5000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=coffee_order_db
DB_PORT=5432
```

### 3. PostgreSQL 데이터베이스 생성

```sql
CREATE DATABASE coffee_order_db;
```

## 실행

### 개발 모드 (자동 리로드)

```bash
npm run dev
```

### 프로덕션 모드

```bash
npm start
```

## API 엔드포인트

### 기본
- `GET /` - 서버 정보
- `GET /api/health` - 헬스 체크

### 메뉴 (추후 추가)
- `GET /api/menus` - 메뉴 목록
- `GET /api/menus/:id` - 단일 메뉴

### 주문 (추후 추가)
- `POST /api/orders` - 주문 생성
- `GET /api/orders/:id` - 주문 조회
- `GET /api/orders` - 주문 목록
- `PATCH /api/orders/:id/status` - 주문 상태 변경

### 관리자 (추후 추가)
- `GET /api/admin/inventory` - 재고 조회
- `PATCH /api/admin/inventory/:menuId` - 재고 업데이트

## 개발 단계

- [ ] 기본 서버 설정 ✅
- [ ] PostgreSQL 마이그레이션
- [ ] 메뉴 라우트 구현
- [ ] 주문 라우트 구현
- [ ] 관리자 라우트 구현
- [ ] 에러 처리 및 로깅
- [ ] 요청/응답 검증
- [ ] 프런트엔드 연동
- [ ] 배포 최적화

## 사용 기술

- **Express.js**: 웹 프레임워크
- **PostgreSQL**: 데이터베이스
- **CORS**: 크로스 오리진 요청 처리
- **Nodemon**: 개발 중 자동 리로드

## 주의사항

1. `.env` 파일은 Git에 커밋하지 마세요
2. PostgreSQL이 실행 중인지 확인하세요
3. 포트 5000이 이미 사용 중인 경우 `.env`에서 PORT 수정
