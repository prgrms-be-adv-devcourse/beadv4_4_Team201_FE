# Auth0 인증 통합 및 세션 최적화

**작성일**: 2026-01-31
**범위**: Frontend Authentication
**상태**: 완료 (테스트 필요)

---

## 1. 개요

Auth0 v4 SDK로의 마이그레이션과 백엔드 인증 시스템 통합 작업을 완료했습니다.
주요 변경사항은 토큰 처리 방식 수정, API 엔드포인트 v2 마이그레이션,
그리고 불필요한 로그인 API 호출을 줄이기 위한 세션 최적화입니다.

---

## 2. 변경 파일 목록

### 핵심 인증 파일
| 파일 | 변경 내용 |
|------|----------|
| `src/lib/auth/auth0.ts` | audience 설정 추가 |
| `src/app/api/auth/sync/route.ts` | idToken 접근 경로 수정, 에러 처리 개선 |
| `src/app/api/proxy/[...path]/route.ts` | getAccessToken() 메서드 사용 |
| `src/features/auth/components/AuthInitializer.tsx` | sessionStorage + getMe 최적화 |
| `src/features/auth/components/LogoutButton.tsx` | 로그아웃 시 sessionStorage 클리어 |

### API 클라이언트 파일
| 파일 | 변경 내용 |
|------|----------|
| `src/lib/api/client.ts` | ApiError에 status 필드 추가 |
| `src/lib/api/cart.ts` | 엔드포인트 /api/v2/ 마이그레이션 |
| `src/lib/api/fundings.ts` | 엔드포인트 /api/v2/ 마이그레이션 |
| `src/lib/api/home.ts` | 엔드포인트 /api/v2/ 마이그레이션 |
| `src/lib/api/members.ts` | 엔드포인트 /api/v2/ 마이그레이션 |
| `src/lib/api/products.ts` | 엔드포인트 /api/v2/ 마이그레이션 |
| `src/lib/api/wallet.ts` | 엔드포인트 /api/v2/ 마이그레이션 |
| `src/lib/api/wishlists.ts` | 엔드포인트 /api/v2/ 마이그레이션 |

### 기타 파일
| 파일 | 변경 내용 |
|------|----------|
| `src/app/auth/complete-signup/page.tsx` | 409 Conflict를 성공으로 처리 |
| `src/features/auth/components/UserMenu.tsx` | useProfile 훅으로 닉네임 표시 |
| `src/features/home/components/WelcomeSection.tsx` | useProfile 훅으로 닉네임 표시 |
| `src/lib/providers/msw-provider.tsx` | API_MOCKING=disabled 지원 |
| `src/mocks/handlers.ts` | v2 엔드포인트 + 와일드카드 패턴 |

---

## 3. 주요 변경사항 상세

### 3.1 Auth0 v4 SDK 호환성 수정

**문제**: Auth0 v4 SDK에서 토큰 접근 방식이 변경됨

**해결**:

```typescript
// auth0.ts - audience 설정 추가
export const auth0 = new Auth0Client({
  authorizationParameters: {
    scope: 'openid profile email',
    audience: process.env.AUTH0_AUDIENCE,  // 추가
  },
});

// sync/route.ts - idToken 접근 경로 수정
const session = await auth0.getSession();
const idToken = session?.tokenSet?.idToken;  // v4 방식

// proxy/route.ts - accessToken 획득 방식 수정
const tokenResult = await auth0.getAccessToken();  // v4 메서드
const accessToken = tokenResult.token;
```

### 3.2 id_token vs access_token

```
+------------------+------------------------+------------------------+
|                  | id_token               | access_token           |
+------------------+------------------------+------------------------+
| 용도             | 사용자 신원 증명       | API 호출 인가          |
| audience         | Auth0 Client ID        | API Identifier         |
| 사용처           | /api/auth/sync         | /api/proxy/*           |
+------------------+------------------------+------------------------+
```

### 3.3 세션 동기화 최적화

**문제**: 페이지 이동/새로고침마다 백엔드 login API 호출

**해결**: 2단계 체크 도입

```
페이지 로드
    |
    v
[sessionStorage 체크] ---> 있음 ---> 스킵
    |
    v (없음)
[GET /api/v2/members/me] ---> 200 OK ---> sessionStorage 저장, 완료
    |
    v (404/에러)
[POST /api/auth/sync] ---> login 호출 ---> sessionStorage 저장
    |
    v (isNewUser)
[/auth/complete-signup 리다이렉트]
```

**AuthInitializer.tsx 핵심 로직**:

```typescript
const SYNC_SESSION_KEY = 'auth_synced';

// 1. sessionStorage 체크 (같은 탭 내 중복 방지)
if (sessionStorage.getItem(SYNC_SESSION_KEY)) {
  return;
}

// 2. 경량 API로 회원 존재 여부 확인
try {
  const member = await getMe();
  if (member) {
    sessionStorage.setItem(SYNC_SESSION_KEY, 'true');
    return;  // login 호출 스킵
  }
} catch {
  // 회원 없음, sync 진행
}

// 3. 신규 회원일 때만 sync (login) 호출
const result = await sync();
sessionStorage.setItem(SYNC_SESSION_KEY, 'true');
```

### 3.4 409 Conflict 처리

**배경**: `UserAuthenticatedEvent`가 자동으로 회원을 생성하므로,
프론트엔드에서 signup 호출 시 409 Conflict 발생 가능

**해결**: 409를 성공으로 처리

```typescript
// complete-signup/page.tsx
onError: (error: any) => {
  if (error?.status === 409 || error?.message?.includes('409')) {
    // 이미 회원이 생성됨 - 성공으로 처리
    queryClient.invalidateQueries({ queryKey: ['me'] });
    toast.success('프로필 설정이 완료되었습니다!');
    router.push('/');
    return;
  }
  toast.error('프로필 업데이트에 실패했습니다.');
}
```

### 3.5 API 엔드포인트 v2 마이그레이션

모든 API 클라이언트 파일에서 `/api/` → `/api/v2/`로 변경

```typescript
// Before
return apiClient.get<Cart>('/api/cart');

// After
return apiClient.get<Cart>('/api/v2/cart');
```

---

## 4. 환경 변수

```env
# .env.local에 필요한 변수
AUTH0_AUDIENCE=https://api.giftify.app  # 또는 백엔드 API identifier
NEXT_PUBLIC_API_MOCKING=disabled        # 실제 백엔드 사용 시
```

---

## 5. 테스트 체크리스트

### 인증 플로우
- [ ] Auth0 로그인 → 홈페이지 정상 이동
- [ ] 신규 사용자 → /auth/complete-signup 리다이렉트
- [ ] 기존 사용자 → 홈페이지 바로 이동
- [ ] 로그아웃 → 세션 클리어 확인

### 세션 최적화
- [ ] 같은 탭에서 페이지 이동 시 login API 호출 안 함
- [ ] 새로고침 시 login API 호출 안 함 (sessionStorage)
- [ ] 새 탭 열 때 getMe만 호출 (기존 회원)
- [ ] 로그아웃 후 재로그인 시 정상 동작

### API 호출
- [ ] /api/v2/members/me 정상 응답
- [ ] /api/v2/cart, /api/v2/home 등 v2 엔드포인트 정상 작동

---

## 6. 알려진 이슈

### 6.1 백엔드 미구현 엔드포인트
- `/api/v2/home` - 404 (백엔드 구현 필요)
- `/api/v2/cart` - 404 (백엔드 구현 필요)

### 6.2 JWT 검증 실패 로그
백엔드에서 `Failed to authenticate since the JWT was invalid` 로그 발생 시:
- access_token의 audience가 백엔드 설정과 일치하는지 확인
- Auth0 API 설정에서 올바른 audience 확인

---

## 7. 관련 백엔드 변경사항 (참고)

프론트엔드 변경과 함께 백엔드에서도 수정이 필요했던 사항:

1. **SecurityConfig.java**: 공개 엔드포인트용 별도 SecurityFilterChain
2. **SharedSecurityAutoConfiguration.java**: idTokenDecoder 빈 추가
3. **AuthService.java**: idTokenDecoder 사용
4. **LoginService.java**: @Transactional(readOnly = true) → @Transactional

---

## 8. 커밋 이력

```
ea2c768 Feat: 회원 프로필 정보를 useProfile 훅으로 표시
d261556 Refactor: MSW 핸들러 v2 엔드포인트 및 와일드카드 패턴 적용
7b5fb47 Refactor: API 엔드포인트 v2 마이그레이션
b1dd272 Fix: API 에러 처리 및 409 Conflict 핸들링 개선
f434262 Fix: Auth0 v4 SDK 호환성 수정
```

**미커밋 변경사항**:
- AuthInitializer.tsx: sessionStorage + getMe 최적화
- LogoutButton.tsx: 로그아웃 시 sessionStorage 클리어

---

## 9. 다음 단계

1. 미커밋 변경사항 커밋 및 푸시
2. 백엔드 `/api/v2/home`, `/api/v2/cart` 구현 대기
3. E2E 테스트로 전체 플로우 검증
