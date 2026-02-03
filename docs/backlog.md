# 프로젝트 백로그

## 📋 할 일 (To Do)

### 인증 & 보안

- [ ] **Auth0 세션 유지 기간 짧게 변경** - 현재 7일에서 더 짧은 기간으로 조정
  - Auth0 Dashboard에서 Absolute Lifetime, Inactivity Timeout 설정 변경
  - 참고: `/docs/auth0-session-guide.md`

### 백엔드 연동

- [ ] 상품 상세 조회 API 404 문제 해결 (`/api/products/{id}`)
- [ ] 장바구니 API 엔드포인트 확인 및 연동 (`/api/v2/cart` → 실제 백엔드 경로)
- [ ] 펀딩 생성 API 연동 (친구 위시리스트에서 펀딩 개설)

### 기능 개선

- [ ] 친구 관계 기능 구현 (백엔드 API 필요)
- [ ] 전체 위시리스트/회원 목록 API 구현 (현재는 ID 직접 입력 방식)
- [ ] 상품 이미지 URL 백엔드에서 관리 (현재 placeholder 사용)

### UI/UX

- [ ] 모바일 반응형 최적화
- [ ] 로딩 상태 개선 (Skeleton UI)
- [ ] 에러 상태 처리 개선

---

## ✅ 완료 (Done)

### 2026-02-03

- [x] 상품 상세 페이지 29cm 스타일 리뉴얼
- [x] 장바구니 담기, 바로 구매하기 버튼 구현
- [x] 찜하기/공유하기 기능 추가
- [x] 백엔드 상품 API 연동 (`/api/products/search`)
- [x] 친구 위시리스트 페이지 UI 개선
- [x] 위시리스트 탐색 페이지 (`/explore`) 추가
- [x] MSW 비활성화 옵션 추가
- [x] Auth0 세션 구조 문서화

---

## 📝 메모

- 백엔드 Swagger: `http://localhost:8080/swagger-ui/index.html`
- Auth0 Dashboard: `https://manage.auth0.com/`
