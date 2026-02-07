# 프로젝트 백로그

> 최종 수정: 2026-02-07
> 분류 기준: 프론트엔드 관점, 우선순위(P0~P2) + 백엔드 의존성 명시

---

## 할 일 (To Do)

### P0: 백엔드 연동 (High Priority)

MSW 목 데이터 기반에서 실제 백엔드 API로 전환하는 작업입니다.
현재 13개 Phase 구현이 완료되어 페이지/컴포넌트는 존재하나, 대부분 MSW 기반으로 동작 중입니다.

#### A1. ~~상품 상세 조회 API 404 문제 해결~~ (해결됨)

- **상태**: 해결 (2026-02-07 확인, API 정상 동작)
- **설명**: `/api/v2/products/{id}` 호출 시 404 반환 문제
- **백엔드 API**: `GET /api/v2/products/{id}` (스펙 확인됨, `RsDataProductDto` 응답)
- **프론트 파일**: `src/app/products/[id]/page.tsx`, `src/features/product/api/`
- **확인 사항**:
  - 백엔드에 해당 상품 ID가 실제로 존재하는지 확인
  - 프론트 API 클라이언트의 엔드포인트 경로가 `/api/v2/products/{id}`와 일치하는지 확인
  - `RsDataProductDto` 래퍼 응답 (`{ result, data, message, errorCode }`) 파싱 처리

#### A2. 장바구니 API 엔드포인트 정렬

- **상태**: 해결 (2026-02-07, 프론트 버그 수정 완료)
- **설명**: 프론트의 장바구니 API 경로와 백엔드 실제 경로 불일치 가능성
- **백엔드 API**: `GET /api/v2/carts`, `POST /api/v2/carts` (인증 토큰으로 사용자 식별)
- **프론트 파일**: `src/lib/api/cart.ts`, `src/features/cart/hooks/`
- **해결 내용**:
  - 엔드포인트 경로 확인: `/api/v2/carts` (user-centric) 정상
  - RsData 이중 언래핑 버그 수정 (`client.ts` 자동 언래핑과 충돌)
  - `toggleCartItemSelection` → 로컬 캐시 전용으로 전환 (서버 refetch 시 리셋 방지)
- **백엔드 요청 필요** → A2-1 참조

#### A2-1. 장바구니 CRUD API 추가 요청 (백엔드)

- **상태**: 백엔드팀 요청 필요
- **설명**: 장바구니 아이템 수정/삭제/비우기 API가 백엔드에 없음
- **필요 API**:
  - `PATCH /api/v2/carts/items/{itemId}` - 아이템 금액 수정
  - `DELETE /api/v2/carts/items/{itemId}` - 아이템 삭제
  - `DELETE /api/v2/carts` - 장바구니 비우기
- **프론트 현황**: 해당 함수들이 `throw Error`로 구현되어, 장바구니 페이지에서 금액 변경/삭제 시 에러 발생
- **프론트 파일**: `src/lib/api/cart.ts` (`updateCartItem`, `removeCartItem`, `clearCart`)

#### A3. 펀딩 생성 API 연동

- **상태**: 미해결 (백엔드 API 존재 여부 확인 필요)
- **설명**: 친구 위시리스트에서 펀딩 개설하는 기능
- **백엔드 API**: 펀딩 생성 엔드포인트가 현재 Swagger에 미노출
  - 기존 엔드포인트: `GET /api/fundings/{id}`, `/accept`, `/refuse`, `/expire`, `/close`
  - `POST /api/fundings` (생성)는 스펙에서 미확인 -> **백엔드팀 확인 필요**
- **프론트 파일**: `src/features/funding/api/`, 펀딩 생성 모달 컴포넌트
- **선행 조건**: 백엔드에서 펀딩 생성 API 제공 필요

#### A4. 주문(Order) API 연동

- **상태**: 미착수
- **설명**: 결제 플로우에서 주문 생성/조회 연동
- **백엔드 API**:
  - `POST /api/v2/orders` - 주문 생성 (`PlaceOrderRequest` -> `RsDataPlaceOrderResult`)
  - `GET /api/v2/orders` - 주문 목록 조회 (페이징, `RsDataGetOrdersResponse`)
  - `GET /api/v2/orders/{orderId}` - 주문 상세 조회 (`RsDataGetOrderDetailResponse`)
- **프론트 파일**: `src/features/order/`, `src/app/checkout/`
- **주요 타입**:
  - `PlaceOrderItemRequest`: `wishlistItemId`, `receiverId`, `amount(Money)`, `orderItemType`
  - `orderItemType`: `NORMAL_ORDER` | `FUNDING_GIFT` | `NORMAL_GIFT`
  - `method`: `DEPOSIT` (예치금 결제) 외 카드/간편결제 등

#### A5. 결제(Payment) - Toss PG SDK 연동

- **상태**: 미착수
- **설명**: 예치금 충전을 위한 Toss PG 결제 연동
- **백엔드 API**:
  - `POST /api/v2/payments/charge` - 결제 생성 (`PaymentChargeRequest` -> `PaymentChargeResponse`)
  - `POST /api/v2/payments/confirm` - 결제 승인 (`PaymentConfirmRequest` -> `PaymentConfirmResponse`)
- **프론트 파일**: `src/features/payment/`, `src/app/wallet/charge/`
- **연동 플로우**:
  1. `POST /api/v2/payments/charge`로 Payment 레코드 생성
  2. 응답의 `orderId`, `amount`로 프론트에서 Toss SDK 호출
  3. Toss 결제 완료 후 `POST /api/v2/payments/confirm` 호출
- **주의**: `src/features/payment/`는 수정 금지 영역 - 담당자 확인 필요

#### A6. 지갑(Wallet) API 연동 검증

- **상태**: 미확인
- **설명**: 지갑 잔액 조회, 거래 내역 조회, 출금 API 실제 연동
- **백엔드 API**:
  - `GET /api/v2/wallet/balance` - 잔액 조회 (`WalletBalanceResponse`)
  - `GET /api/v2/wallet/history` - 거래 내역 조회 (`WalletHistoryResponse`, 페이징)
  - `POST /api/v2/wallet/withdraw` - 출금 요청 (`WithdrawWalletRequest`)
- **프론트 파일**: `src/features/wallet/`, `src/app/wallet/`
- **확인 사항**:
  - `WalletHistoryResponse` 단일 객체 vs 배열 응답 확인 필요
  - 거래 유형 필터: `CHARGE` | `WITHDRAW` | `PAYMENT`

---

### P1: UI/UX 개선 (Medium Priority)

#### B1. 모바일 반응형 최적화

- **설명**: 와이어프레임 기준 해상도 390x844 (iPhone 14 Pro) 기반 최적화
- **참조**: `docs/02-wireframes.md` 디자인 시스템 개요
- **범위**: 전체 페이지 모바일 퍼스트 검토, BottomNav 터치 영역, 카드 컴포넌트 레이아웃

#### B2. Skeleton UI 로딩 상태 개선

- **설명**: 현재 홈 페이지만 Skeleton 구현, 나머지 주요 페이지에도 적용 필요
- **대상 페이지**: 상품 상세, 펀딩 상세, 장바구니, 지갑, 위시리스트
- **참조**: `docs/02-wireframes.md` 3.4절 상태별 UI

#### B3. 에러 상태 처리 개선

- **설명**: 페이지별 세부 에러 핸들링 (네트워크 오류, 404, 권한 없음 등)
- **현재 상태**: 글로벌 `error.tsx`, `not-found.tsx` 존재
- **개선 방향**: 각 페이지별 인라인 에러 UI, 재시도 버튼, 에러 코드별 안내 메시지

---

### P2: 기능 구현 (Low Priority / 백엔드 의존)

#### C1. 친구 관계 기능 구현

- **상태**: 백엔드 API 없음
- **설명**: 친구 추가/삭제/목록 기능
- **선행 조건**: 백엔드에서 친구 관계 API 제공 필요
- **프론트 영향**: 홈 화면 "친구들의 위시리스트" 섹션, 마이페이지 "친구 관리" 메뉴

#### C2. 전체 위시리스트/회원 목록 탐색

- **상태**: 부분 구현 (ID 직접 입력 방식)
- **설명**: 위시리스트 탐색 페이지 (`/explore`)에서 실제 회원 검색/목록 API 필요
- **선행 조건**: 백엔드에서 회원 검색/공개 위시리스트 목록 API 제공 필요

#### C3. 상품 이미지 URL 실제 적용

- **상태**: placeholder 사용 중
- **설명**: 현재 `picsum.photos` 사용, 백엔드에서 실제 이미지 URL 관리 필요
- **선행 조건**: 백엔드 상품 스키마에 이미지 필드 추가, `next.config.ts` 도메인 설정

---

### P2: 와이어프레임 대비 미완성 항목

#### E1. 홈 화면 - 인기 상품 섹션

- **설명**: 와이어프레임에 "인기 상품" 2-column 그리드 존재
- **백엔드 API**: 인기 상품 조회 API 미존재 (`/api/products/popular` 없음)
- **참조**: `docs/02-wireframes.md` 3.1절

#### E2. 펀딩 참여 바텀시트 상세 구현

- **설명**: 금액 입력, 퀵 버튼, 지갑 잔액 표시, 장바구니 담기/바로 결제 분기
- **참조**: `docs/02-wireframes.md` 6.3절, AmountInput 컴포넌트 명세 (2.7절)

#### E3. 지갑 충전 - Toss PG SDK 실제 연동

- **설명**: 충전 금액 선택 UI + Toss SDK 호출 + 결과 콜백 처리
- **참조**: A5 작업과 연관, `docs/02-wireframes.md` 9.2절

#### E4. 결제 완료 화면 상세

- **설명**: 성공 애니메이션, 참여 결과(진행률 변화), 상세 결제 정보
- **참조**: `docs/02-wireframes.md` 8.3절

#### E5. 위시리스트 공개 설정 바텀시트

- **설명**: 전체 공개/친구만/비공개 선택 바텀시트
- **백엔드 API**: `PATCH /api/wishlist/me/settings` (`visibility`: PUBLIC | PRIVATE | FRIENDS_ONLY)
- **참조**: `docs/02-wireframes.md` 4.3절

---

## 완료 (Done)

### 2026-02-03

- [x] 상품 상세 페이지 29cm 스타일 리뉴얼
- [x] 장바구니 담기, 바로 구매하기 버튼 구현
- [x] 찜하기/공유하기 기능 추가
- [x] 백엔드 상품 API 연동 (`/api/products/search`)
- [x] 친구 위시리스트 페이지 UI 개선
- [x] 위시리스트 탐색 페이지 (`/explore`) 추가
- [x] MSW 비활성화 옵션 추가
- [x] Auth0 세션 구조 문서화

### 2026-01-28 (Phase 1~13 완료)

- [x] Foundation & Types (OpenAPI 기반 타입 정의)
- [x] Authentication (Auth0 SDK 통합)
- [x] TanStack Query Integration
- [x] Home Page
- [x] Product Search & Detail
- [x] Wishlist
- [x] Funding Flow
- [x] Cart & Checkout
- [x] Wallet
- [x] My Page
- [x] Error Handling & Polish
- [x] Testing (12개 테스트 케이스)
- [x] Performance & Optimization (SEO, PWA)

---

## 인증 & 보안 (별도 관리)

- [ ] **Auth0 세션 유지 기간 짧게 변경** - 현재 7일에서 더 짧은 기간으로 조정
  - Auth0 Dashboard에서 Absolute Lifetime, Inactivity Timeout 설정 변경
  - 참고: `/docs/auth0-session-guide.md`
  - 주의: 프론트엔드 코드 변경이 아닌 Dashboard 설정 변경

---

## 참고 자료

| 자료 | 위치 |
|------|------|
| 백엔드 Swagger | `http://localhost:8080/swagger-ui/index.html` |
| 백엔드 API 스펙 (최신) | `docs/api-docs.json` (OpenAPI 3.1) |
| 프론트 API 스펙 (초기 설계) | `docs/03-api-spec.yaml` (OpenAPI 3.0) |
| 와이어프레임 & 디자인 시스템 | `docs/02-wireframes.md` |
| Auth0 세션 가이드 | `docs/auth0-session-guide.md` |
| 프론트 구현 인수인계 | `docs/workthrough/260128-GIFTIFY-01-frontend-implementation-summary.md` |
| Auth0 통합 기록 | `docs/workthrough/260131-AUTH-01-auth0-integration-and-session-optimization.md` |
| Auth0 Dashboard | `https://manage.auth0.com/` |

---

## 수정 금지 영역

아래 영역은 읽기만 가능하며, 수정 시 담당자에게 요청:

- `.env*` 파일들
- `src/lib/auth/` - 인증 관련 코드
- `src/features/auth/` - 인증 기능
- `src/features/payment/` - 결제 관련 코드
