# PRD - 백엔드 API (Node.js + Express + PostgreSQL)

## 1. 개요

### 1.1 목적
프런트엔드 애플리케이션을 지원하기 위한 RESTful API 서버 구축

### 1.2 기술 스택
- **서버**: Node.js + Express
- **데이터베이스**: PostgreSQL
- **인증**: 미적용 (학습용)
- **결제**: 미적용 (학습용)

### 1.3 우선순위
매우 높음 (핵심 기능)

---

## 2. 데이터베이스 설계

### 2.1 테이블: Menus (메뉴)

#### 2.1.1 스키마

```sql
CREATE TABLE menus (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  price INTEGER NOT NULL,
  image_url VARCHAR(255),
  stock Integer DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2.1.2 컬럼 설명

| 컬럼명 | 타입 | 설명 | 필수 | 기본값 |
|--------|------|------|------|--------|
| id | SERIAL | 메뉴 고유 ID | ✓ | - |
| name | VARCHAR(100) | 메뉴 이름 (예: "아메리카노(ICE)") | ✓ | - |
| description | VARCHAR(255) | 메뉴 설명 | ✗ | NULL |
| price | INTEGER | 기본 가격 (원) | ✓ | - |
| image_url | VARCHAR(255) | 이미지 URL 또는 파일명 | ✗ | NULL |
| stock | INTEGER | 현재 재고 수량 | ✗ | 10 |
| created_at | TIMESTAMP | 생성 일시 | ✓ | 현재 시간 |
| updated_at | TIMESTAMP | 수정 일시 | ✓ | 현재 시간 |

#### 2.1.3 초기 데이터

```sql
INSERT INTO menus (name, description, price, image_url, stock) VALUES
('아메리카노(ICE)', '상큼한 맛의 차가운 아메리카노', 4000, '🧊', 10),
('아메리카노(HOT)', '따뜻한 아메리카노', 4000, '☕', 10),
('카페라떼', '부드러운 우유의 맛', 5000, '🥛', 10),
('카푸치노', '풍부한 거품의 카푸치노', 5000, '🫧', 10),
('에스프레소', '진한 맛의 에스프레소', 3500, '💪', 10),
('모카', '초콜릿 향의 모카', 5500, '🍫', 10);
```

---

### 2.2 테이블: Options (옵션)

#### 2.2.1 스키마

```sql
CREATE TABLE options (
  id SERIAL PRIMARY KEY,
  menu_id INTEGER NOT NULL,
  name VARCHAR(100) NOT NULL,
  price INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE
);
```

#### 2.2.2 컬럼 설명

| 컬럼명 | 타입 | 설명 | 필수 | 기본값 |
|--------|------|------|------|--------|
| id | SERIAL | 옵션 고유 ID | ✓ | - |
| menu_id | INTEGER | 메뉴 ID (외래키) | ✓ | - |
| name | VARCHAR(100) | 옵션 이름 (예: "샷 추가") | ✓ | - |
| price | INTEGER | 추가 가격 (원) | ✗ | 0 |
| created_at | TIMESTAMP | 생성 일시 | ✓ | 현재 시간 |

#### 2.2.3 초기 데이터

```sql
INSERT INTO options (menu_id, name, price) VALUES
(1, '샷 추가', 500),
(1, '시럽 추가', 0),
(2, '샷 추가', 500),
(2, '시럽 추가', 0),
(3, '샷 추가', 500),
(3, '시럽 추가', 0),
(4, '샷 추가', 500),
(4, '시럽 추가', 0),
(5, '샷 추가', 500),
(5, '시럽 추가', 0),
(6, '샷 추가', 500),
(6, '시럽 추가', 0);
```

---

### 2.3 테이블: Orders (주문)

#### 2.3.1 스키마

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  status VARCHAR(50) DEFAULT 'received',
  total_price INTEGER NOT NULL,
  notes VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2.3.2 컬럼 설명

| 컬럼명 | 타입 | 설명 | 필수 | 기본값 |
|--------|------|------|------|--------|
| id | SERIAL | 주문 고유 ID | ✓ | - |
| status | VARCHAR(50) | 주문 상태 (received/in_progress/completed) | ✗ | 'received' |
| total_price | INTEGER | 총 원하는 금액 | ✓ | - |
| notes | VARCHAR(255) | 특별 요청사항 | ✗ | NULL |
| created_at | TIMESTAMP | 주문 접수 일시 | ✓ | 현재 시간 |
| updated_at | TIMESTAMP | 상태 변경 일시 | ✓ | 현재 시간 |

#### 2.3.3 상태 값

- `received`: 주문 접수 (기본값)
- `in_progress`: 제조 중
- `completed`: 완료

---

### 2.4 테이블: OrderItems (주문 항목)

#### 2.4.1 스키마

```sql
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  menu_id INTEGER NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_id) REFERENCES menus(id)
);
```

#### 2.4.2 컬럼 설명

| 컬럼명 | 타입 | 설명 | 필수 | 기본값 |
|--------|------|------|------|--------|
| id | SERIAL | 주문 항목 고유 ID | ✓ | - |
| order_id | INTEGER | 주문 ID (외래키) | ✓ | - |
| menu_id | INTEGER | 메뉴 ID (외래키) | ✓ | - |
| quantity | INTEGER | 수량 | ✗ | 1 |
| unit_price | INTEGER | 해당 항목의 총 가격 | ✓ | - |
| created_at | TIMESTAMP | 생성 일시 | ✓ | 현재 시간 |

---

### 2.5 테이블: OrderItemOptions (주문 항목의 옵션)

#### 2.5.1 스키마

```sql
CREATE TABLE order_item_options (
  id SERIAL PRIMARY KEY,
  order_item_id INTEGER NOT NULL,
  option_id INTEGER NOT NULL,
  option_name VARCHAR(100),
  option_price INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
  FOREIGN KEY (option_id) REFERENCES options(id)
);
```

#### 2.5.2 컬럼 설명

| 컬럼명 | 타입 | 설명 | 필수 | 기본값 |
|--------|------|------|------|--------|
| id | SERIAL | 옵션 고유 ID | ✓ | - |
| order_item_id | INTEGER | 주문 항목 ID (외래키) | ✓ | - |
| option_id | INTEGER | 옵션 ID (외래키) | ✓ | - |
| option_name | VARCHAR(100) | 옵션 이름 (스냅샷) | ✗ | NULL |
| option_price | INTEGER | 옵션 가격 (스냅샷) | ✗ | 0 |
| created_at | TIMESTAMP | 생성 일시 | ✓ | 현재 시간 |

---

## 3. API 엔드포인트 설계

### 3.1 메뉴 관련 API

#### 3.1.1 메뉴 목록 조회

**요청**
```
GET /api/menus
```

**응답 (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "아메리카노(ICE)",
      "description": "상큼한 맛의 차가운 아메리카노",
      "price": 4000,
      "image_url": "🧊",
      "stock": 10,
      "options": [
        {
          "id": 1,
          "name": "샷 추가",
          "price": 500
        },
        {
          "id": 2,
          "name": "시럽 추가",
          "price": 0
        }
      ]
    },
    ...
  ]
}
```

**에러 응답 (500 Internal Server Error)**
```json
{
  "success": false,
  "message": "메뉴 목록을 불러올 수 없습니다."
}
```

---

#### 3.1.2 단일 메뉴 조회

**요청**
```
GET /api/menus/:id
```

**경로 파라미터**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| id | INTEGER | 메뉴 ID |

**응답 (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "아메리카노(ICE)",
    "description": "상큼한 맛의 차가운 아메리카노",
    "price": 4000,
    "image_url": "🧊",
    "stock": 10,
    "options": [...]
  }
}
```

**에러 응답 (404 Not Found)**
```json
{
  "success": false,
  "message": "해당 메뉴를 찾을 수 없습니다."
}
```

---

### 3.2 주문 관련 API

#### 3.2.1 주문 생성

**요청**
```
POST /api/orders
```

**요청 본문**
```json
{
  "items": [
    {
      "menuId": 1,
      "quantity": 2,
      "options": [1, 2]
    },
    {
      "menuId": 2,
      "quantity": 1,
      "options": [3]
    }
  ],
  "notes": "설탕 적게 주세요"
}
```

**요청 본문 설명**

| 필드 | 타입 | 설명 | 필수 |
|------|------|------|------|
| items | ARRAY | 주문 항목 배열 | ✓ |
| items[].menuId | INTEGER | 메뉴 ID | ✓ |
| items[].quantity | INTEGER | 수량 | ✓ |
| items[].options | ARRAY | 옵션 ID 배열 | ✗ |
| notes | STRING | 특별 요청사항 | ✗ |

**응답 (201 Created)**
```json
{
  "success": true,
  "message": "주문이 успешно 생성되었습니다.",
  "data": {
    "id": 1,
    "status": "received",
    "totalPrice": 13000,
    "items": [
      {
        "id": 1,
        "menuId": 1,
        "menuName": "아메리카노(ICE)",
        "quantity": 2,
        "unitPrice": 5000,
        "options": [
          {
            "id": 1,
            "name": "샷 추가",
            "price": 500
          }
        ]
      }
    ],
    "createdAt": "2026-03-06T13:00:00Z",
    "updatedAt": "2026-03-06T13:00:00Z"
  }
}
```

**에러 응답 (400 Bad Request)**
```json
{
  "success": false,
  "message": "주문 정보가 유효하지 않습니다.",
  "errors": [
    {
      "field": "items",
      "message": "최소 1개 이상의 항목이 필요합니다."
    }
  ]
}
```

**에러 응답 (409 Conflict - 재고 부족)**
```json
{
  "success": false,
  "message": "재고가 부족합니다.",
  "data": {
    "menuId": 1,
    "menuName": "아메리카노(ICE)",
    "requestedQuantity": 15,
    "availableStock": 10
  }
}
```

---

#### 3.2.2 주문 조회

**요청**
```
GET /api/orders/:id
```

**경로 파라미터**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| id | INTEGER | 주문 ID |

**응답 (200 OK)**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "received",
    "totalPrice": 13000,
    "notes": "설탕 적게 주세요",
    "items": [
      {
        "id": 1,
        "menuId": 1,
        "menuName": "아메리카노(ICE)",
        "quantity": 2,
        "unitPrice": 5000,
        "options": [
          {
            "id": 1,
            "name": "샷 추가",
            "price": 500
          }
        ]
      },
      {
        "id": 2,
        "menuId": 2,
        "menuName": "아메리카노(HOT)",
        "quantity": 1,
        "unitPrice": 4000,
        "options": []
      }
    ],
    "createdAt": "2026-03-06T13:00:00Z",
    "updatedAt": "2026-03-06T13:05:00Z"
  }
}
```

**에러 응답 (404 Not Found)**
```json
{
  "success": false,
  "message": "해당 주문을 찾을 수 없습니다."
}
```

---

#### 3.2.3 주문 목록 조회 (관리자용)

**요청**
```
GET /api/orders?status=received&page=1&limit=10
```

**쿼리 파라미터**
| 파라미터 | 타입 | 설명 | 기본값 |
|---------|------|------|--------|
| status | STRING | 주문 상태 필터 | 없음 |
| page | INTEGER | 페이지 번호 | 1 |
| limit | INTEGER | 페이지당 항목 수 | 10 |

**응답 (200 OK)**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "status": "received",
        "totalPrice": 13000,
        "createdAt": "2026-03-06T13:00:00Z",
        "updatedAt": "2026-03-06T13:00:00Z"
      },
      ...
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

---

#### 3.2.4 주문 상태 변경

**요청**
```
PATCH /api/orders/:id/status
```

**경로 파라미터**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| id | INTEGER | 주문 ID |

**요청 본문**
```json
{
  "status": "in_progress"
}
```

**응답 (200 OK)**
```json
{
  "success": true,
  "message": "주문 상태가 변경되었습니다.",
  "data": {
    "id": 1,
    "status": "in_progress",
    "updatedAt": "2026-03-06T13:05:00Z"
  }
}
```

**에러 응답 (400 Bad Request)**
```json
{
  "success": false,
  "message": "유효하지 않은 상태입니다.",
  "validStatuses": ["received", "in_progress", "completed"]
}
```

---

### 3.3 관리자 - 재고 관리 API

#### 3.3.1 재고 조회

**요청**
```
GET /api/admin/inventory
```

**응답 (200 OK)**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "아메리카노(ICE)",
      "stock": 10,
      "price": 4000,
      "status": "normal"
    },
    ...
  ]
}
```

---

#### 3.3.2 재고 업데이트

**요청**
```
PATCH /api/admin/inventory/:menuId
```

**경로 파라미터**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| menuId | INTEGER | 메뉴 ID |

**요청 본문**
```json
{
  "stock": 8
}
```

**응답 (200 OK)**
```json
{
  "success": true,
  "message": "재고가 업데이트되었습니다.",
  "data": {
    "id": 1,
    "name": "아메리카노(ICE)",
    "stock": 8,
    "updatedAt": "2026-03-06T13:10:00Z"
  }
}
```

**에러 응답 (400 Bad Request)**
```json
{
  "success": false,
  "message": "재고 수량은 음수가 될 수 없습니다."
}
```

---

## 4. 사용자 흐름 및 API 호출 시퀀스

### 4.1 주문 흐름

```
1. 프런트엔드 초기화
   └─ GET /api/menus → 메뉴 목록 조회

2. 사용자가 메뉴 선택 및 장바구니 추가
   └─ (클라이언트 로컬 상태에서만 관리)

3. 사용자가 주문하기 버튼 클릭
   └─ POST /api/orders → 주문 생성
   └─ 응답에서 order_id 획득

4. 관리자 화면에서 주문 조회
   └─ GET /api/orders → 주문 목록 조회
   또는
   └─ GET /api/orders/:id → 특정 주문 조회

5. 관리자가 주문 상태 변경
   └─ PATCH /api/orders/:id/status → 상태 변경
   (received → in_progress → completed)
```

### 4.2 재고 관리 흐름

```
1. 관리자 화면 초기화
   └─ GET /api/admin/inventory → 재고 조회

2. 주문 생성 시 (POST /api/orders)
   └─ 자동으로 해당 메뉴의 재고 차감
   └─ 재고 부족 시 409 에러 반환

3. 관리자가 수동으로 재고 조정
   └─ PATCH /api/admin/inventory/:menuId → 재고 업데이트
```

---

## 5. 데이터 검증 규칙

### 5.1 메뉴 검증
- `name`: 필수, 1-100자
- `price`: 필수, 양수
- `stock`: 0 이상의 정수

### 5.2 주문 검증
- `items`: 필수, 최소 1개 이상
- `menuId`: 필수, 유효한 메뉴 ID
- `quantity`: 필수, 1 이상의 정수
- `options`: 선택사항, 배열
- 재고 확인: 요청한 수량이 현재 재고보다 많으면 409 에러

### 5.3 상태 변경 검증
- 유효한 상태: `received`, `in_progress`, `completed`
- 상태 변경 순서: received → in_progress → completed

---

## 6. 에러 처리

### 6.1 HTTP 상태 코드

| 상태 코드 | 의미 | 예시 |
|----------|------|------|
| 200 | OK | 요청 성공 |
| 201 | Created | 리소스 생성 성공 |
| 400 | Bad Request | 유효하지 않은 요청 |
| 404 | Not Found | 리소스를 찾을 수 없음 |
| 409 | Conflict | 재고 부족 |
| 500 | Internal Server Error | 서버 오류 |

### 6.2 에러 응답 형식

```json
{
  "success": false,
  "message": "에러 메시지",
  "errors": [
    {
      "field": "fieldName",
      "message": "구체적인 에러 메시지"
    }
  ]
}
```

---

## 7. 데이터베이스 제약 조건

### 7.1 외래 키 제약
- `options.menu_id` → `menus.id` (ON DELETE CASCADE)
- `order_items.order_id` → `orders.id` (ON DELETE CASCADE)
- `order_items.menu_id` → `menus.id`
- `order_item_options.order_item_id` → `order_items.id` (ON DELETE CASCADE)
- `order_item_options.option_id` → `options.id`

### 7.2 유니크 제약
- 없음 (현재)

### 7.3 체크 제약
- `menus.price` > 0
- `menus.stock` >= 0
- `order_items.quantity` > 0
- `orders.total_price` > 0

---

## 8. 성능 고려사항

### 8.1 인덱스
- `menus.id` (기본 PK 인덱스)
- `orders.created_at` (날짜 범위 쿼리용)
- `orders.status` (상태 필터링용)
- `order_items.order_id` (주문별 항목 조회용)

### 8.2 페이징
- 주문 목록 조회 시 페이징 적용 (기본 10개)

---

## 9. 보안 고려사항

### 9.1 입력 검증
- 모든 사용자 입력값 검증
- SQL Injection 방지를 위해 Prepared Statements 사용

### 9.2 권한 (추후)
- 관리자 API는 인증 추가 필요
- 일반 사용자는 자신의 주문만 조회 가능

### 9.3 로깅
- 모든 주문 생성/변경 로깅
- 재고 변경 로깅

---

## 10. 추후 확장 기능

### 10.1 인증
- JWT 토큰 기반 사용자 인증
- 관리자 역할 구분

### 10.2 결제
- 결제 API 통합
- 결제 상태 관리

### 10.3 통계
- 일일/주간/월간 판매 통계
- 메뉴별 인기도

### 10.4 알림
- 주문 상태 변경 푸시 알림
- 재고 부족 알림

---

## 11. API 엔드포인트 요약

### 최종 엔드포인트 목록

| HTTP 메서드 | 엔드포인트 | 설명 |
|-----------|----------|------|
| GET | /api/menus | 메뉴 목록 조회 |
| GET | /api/menus/:id | 단일 메뉴 조회 |
| POST | /api/orders | 주문 생성 |
| GET | /api/orders/:id | 주문 조회 |
| GET | /api/orders | 주문 목록 조회 (관리자) |
| PATCH | /api/orders/:id/status | 주문 상태 변경 |
| GET | /api/admin/inventory | 재고 조회 |
| PATCH | /api/admin/inventory/:menuId | 재고 업데이트 |

---

## 12. 개발 로드맵

### Phase 1: 핵심 기능 (1주)
- [x] 데이터베이스 설계
- [ ] Express 서버 구축
- [ ] /api/menus 엔드포인트
- [ ] /api/orders 엔드포인트

### Phase 2: 관리 기능 (1주)
- [ ] 주문 상태 관리
- [ ] 재고 관리 API
- [ ] 에러 핸들링

### Phase 3: 최적화 및 배포 (1주)
- [ ] 성능 최적화
- [ ] 로깅 추가
- [ ] 배포
