# Giftify Frontend

## 프로젝트 개요

**Giftify**는 위시리스트 기반 크라우드 펀딩 선물 서비스입니다.

### 핵심 기능
- 사용자가 친구의 위시리스트를 확인하고 해당 상품에 대한 펀딩을 열어 함께 선물을 구매
- 다양한 상품을 일반 이커머스처럼 구매하거나 나에게 선물하기 (2차 목표)

### 타겟 사용자
- MZ세대 일반 소비자 (20~30대)
- 친구/연인 간 선물 문화

### 개발 단계
- **MVP 개발 중** (부트캠프 프로젝트)

---

## 기술 스택

### Core
- **Next.js 16** + **React 19** + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui** (Radix UI)

### 상태 관리
- **서버 상태**: React Query (TanStack Query v5)
- **클라이언트 상태**: Zustand

### 폼 & 유효성 검사
- **react-hook-form** + **Zod**

### 인증
- **Auth0** (@auth0/nextjs-auth0)

### 테스트
- **Vitest** + **Testing Library** + **MSW** (Mock Service Worker)

### 최적화 기법
- React Server Components (RSC) 활용
- Streaming / Suspense 활용
- next/image를 통한 이미지 최적화

---

## 프로젝트 구조

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router 페이지
│   │   ├── (public)/           # 공개 페이지 (로그인 불필요)
│   │   ├── (auth)/             # 인증 필요 페이지
│   │   ├── api/                # API Routes (백엔드 프록시)
│   │   └── ...
│   │
│   ├── features/               # 도메인별 기능 모듈
│   │   ├── auth/               # 인증
│   │   ├── product/            # 상품
│   │   │   ├── api/            # API 호출 함수
│   │   │   ├── components/     # 도메인 전용 컴포넌트
│   │   │   └── hooks/          # React Query hooks
│   │   ├── cart/               # 장바구니
│   │   ├── wishlist/           # 위시리스트
│   │   ├── funding/            # 펀딩
│   │   ├── wallet/             # 지갑
│   │   ├── order/              # 주문
│   │   ├── payment/            # 결제
│   │   └── profile/            # 프로필
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui 컴포넌트
│   │   ├── common/             # 공통 컴포넌트
│   │   └── layout/             # 레이아웃 컴포넌트
│   │
│   ├── lib/
│   │   ├── api/                # API 클라이언트 & 함수
│   │   ├── auth/               # 인증 유틸리티
│   │   ├── query/              # React Query 설정 & 키
│   │   ├── providers/          # Context Providers
│   │   ├── utils/              # 유틸리티 함수
│   │   ├── error/              # 에러 처리
│   │   ├── prefetch/           # 데이터 프리페칭
│   │   └── seo/                # SEO 유틸리티
│   │
│   ├── stores/                 # Zustand 스토어
│   ├── types/                  # TypeScript 타입 정의
│   ├── mocks/                  # MSW 목 핸들러
│   └── test/                   # 테스트 설정 & 유틸리티
│
├── public/                     # 정적 파일
└── docs/                       # 문서
```

---

## 코드 컨벤션

### 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 변수/함수 | camelCase | `getUserData`, `isLoading` |
| 컴포넌트 | PascalCase | `ProductCard`, `UserProfile` |
| 타입/인터페이스 | PascalCase | `ProductData`, `UserProfile` |
| 파일명 (컴포넌트) | PascalCase | `ProductCard.tsx` |
| 파일명 (훅) | camelCase + use prefix | `useProducts.ts` |
| 파일명 (유틸) | camelCase | `formatPrice.ts` |
| 상수 | UPPER_SNAKE_CASE | `MAX_ITEMS`, `API_BASE_URL` |

### Export 방식
- **named export** 사용 (default export 지양)
- 단, Next.js 페이지 컴포넌트는 default export 필수

```typescript
// Good
export function ProductCard({ product }: ProductCardProps) { ... }

// Avoid (페이지 제외)
export default function ProductCard({ product }: ProductCardProps) { ... }
```

### Props 타입 정의
- **interface** 사용 (type 지양)

```typescript
// Good
interface ProductCardProps {
  product: Product;
  onSelect?: (id: string) => void;
}

// Avoid
type ProductCardProps = {
  product: Product;
  onSelect?: (id: string) => void;
};
```

### Import 순서
1. React / Next.js
2. 외부 라이브러리
3. 내부 모듈 (@/ alias)
4. 타입 (type-only imports)

```typescript
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { ProductCard } from '@/features/product/components';
import { useProducts } from '@/features/product/hooks';
import { formatPrice } from '@/lib/utils';

import type { Product } from '@/types/product';
```

---

## 개발 환경

### 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트
npm run lint

# 테스트 실행
npm test
```

### 환경 변수
- `.env.local` 파일에 로컬 환경 변수 설정
- **주의**: `.env*` 파일은 절대 직접 수정하지 말고 담당자에게 요청

---

## 테스트 전략

### 커버리지 목표
- **80% 이상**

### 필수 테스트 대상
1. **React Query hooks** - API 호출 로직
2. **비즈니스 로직** - 유틸 함수, 폼 검증, 계산 로직
3. **E2E 테스트** - 주요 사용자 플로우

### 테스트 도구
- **Vitest** - 단위/통합 테스트
- **Testing Library** - 컴포넌트 테스트
- **MSW** - API 모킹

---

## Git 워크플로우

### 에이전트 Git 관리
- **커밋 생성**: 에이전트가 작업 완료 후 커밋 메시지 작성 및 커밋 수행
- **원격 병합**: 에이전트가 PR 생성 및 원격 저장소 병합 관리
- 사용자 요청 시 에이전트가 Git 작업을 자율적으로 수행

### 브랜치 전략
- **GitHub Flow** 사용
- `main` + `feature/*` 브랜치

### 커밋 메시지 형식
`.gitmessage.txt` 참고

```
<타입>: <제목> (최대 50자)

<본문> (선택사항)

Resolves #123 (선택사항)
```

**타입 종류**:
- `Feat:` - 새로운 기능
- `Fix:` - 버그 수정
- `Docs:` - 문서 수정
- `Style:` - 포맷팅 (코드 변경 X)
- `Refactor:` - 리팩토링
- `Test:` - 테스트 코드
- `Chore:` - 빌드, 설정 변경
- `Design:` - UI 디자인 변경
- `!HOTFIX:` - 긴급 버그 수정
- `!BREAKING CHANGE:` - API 변경

---

## 디자인 시스템

### 디자인 레퍼런스
- **UI/비주얼**: [29cm](https://www.29cm.co.kr/) 웹/모바일 오마주
- **UX/인터랙션**: 토스 디자인 시스템 참고

### 반응형 디자인
- 웹/모바일 모두 지원 (29cm 스타일)
- Mobile-first 접근

### 컴포넌트 우선순위
1. **shadcn/ui** 컴포넌트 우선 확인 및 사용
2. 없으면 **커스텀 컴포넌트** 제작

### UI 컴포넌트 위치
- `src/components/ui/` - shadcn/ui 컴포넌트
- `src/components/common/` - 커스텀 공통 컴포넌트
- `src/features/[domain]/components/` - 도메인 전용 컴포넌트

---

## API 연동

### 현재 상태
- 환경변수로 API URL 설정 + MSW 모킹 혼용

### 향후 계획
- Next.js API Routes를 통한 프록시 방식으로 전환 예정

### React Query 패턴

```typescript
// hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getProducts } from '@/lib/api/products';

export function useProducts(params?: ProductQueryParams) {
  return useQuery({
    queryKey: queryKeys.products(params),
    queryFn: () => getProducts(params),
  });
}
```

---

## 주의사항

### 수정 금지 영역
아래 영역은 **읽기만 가능**하며, 수정이 필요한 경우 반드시 담당자에게 요청:

- `.env*` 파일들
- `src/lib/auth/` - 인증 관련 코드
- `src/features/auth/` - 인증 기능
- `src/features/payment/` - 결제 관련 코드
