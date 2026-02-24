# Giftify Frontend

Giftify는 기본적인 이커머스 환경에 친구의 위시리스트 상품을 **펀딩** 형태로 선물할 수 있는 기능을 결합한 이커머스 서비스입니다.

> "친구가 정말 원하는 선물을, 무리하지 않는 금액으로 함께 선물할 수는 없을까?"

기존 선물하기 서비스는 편리하지만, 가격이 높은 상품의 경우 금액 부담으로 선택하기 어려운 한계가 있습니다.
Giftify는 **여러 명이 함께 하나의 선물을 완성하는** 펀딩 개념을 도입하여 이를 해결합니다.

## 서비스 흐름

```
친구가 위시리스트에 상품 등록
        |
해당 상품에 대해 펀딩 생성
        |
여러 친구가 각자 가능한 금액만큼 펀딩 참여
        |
펀딩 금액 100% 달성 시 결제 완료
        |
선물 수령
```

## 주요 기능

- **위시리스트**: 친구들과 위시리스트를 공유하고 서로의 취향을 확인
- **선물 펀딩**: 친구가 원하는 고가의 선물을 여러 명이 함께 펀딩하여 선물 (진행률, 참여자 메시지)
- **장바구니 & 결제**: Toss Payments 연동을 통한 간편 결제
- **지갑**: 포인트 충전 및 선물 결제 (충전/사용 내역 관리)
- **친구 관계**: 친구 요청/수락, 친구의 위시리스트 조회
- **판매자 관리**: 상품 등록/수정, 재고 이력 조회

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS, Shadcn/ui (Radix UI) |
| Client State | Zustand |
| Server State | TanStack Query |
| Payment | Toss Payments |
| Testing | Vitest, React Testing Library |
| CI | GitHub Actions (lint + build) |
| Deploy | Vercel |

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# http://localhost:3000
```

### 환경 변수

```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_IMAGE_BASE_URL=<이미지 서버 URL>
NEXT_PUBLIC_TOSS_CLIENT_KEY=<토스 클라이언트 키>
NEXT_PUBLIC_API_MOCKING=enabled|disabled
```

## 테스트

```bash
npm test
```

## 프로젝트 구조

```
src/
  app/           # Next.js App Router 페이지
    cart/        # 장바구니
    checkout/    # 결제
    friends/     # 친구 관리
    fundings/    # 펀딩 목록/상세
    orders/      # 주문 내역
    products/    # 상품 목록/상세
    profile/     # 프로필
    seller/      # 판매자 관리
    wallet/      # 지갑
    wishlist/    # 위시리스트
  components/    # 공통 UI 컴포넌트
  features/      # 도메인별 컴포넌트/로직
  lib/           # API 클라이언트, 유틸리티
  mocks/         # MSW 핸들러 (API Mocking)
  types/         # TypeScript 타입 정의
```

## 관련 문서

- [Backend Repository](https://github.com/prgrms-be-adv-devcourse/beadv4_4_Team201_BE)
