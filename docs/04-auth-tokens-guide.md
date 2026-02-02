# Auth0 토큰 가이드

## 개요

이 문서는 Auth0 인증에서 사용되는 **ID Token**과 **Access Token**의 차이점, 그리고 개발 시 토큰을 확인하는 방법에 대해 설명합니다.

---

## ID Token vs Access Token

### 비교표

| 구분          | ID Token                               | Access Token                                |
| ------------- | -------------------------------------- | ------------------------------------------- |
| **목적**      | 사용자 **신원 증명** (Authentication)  | API **접근 권한** (Authorization)           |
| **형식**      | 항상 JWT (서명됨, `xxxxx.yyyyy.zzzzz`) | JWT 또는 **Opaque Token** (랜덤 문자열)     |
| **대상**      | 클라이언트 앱 (프론트엔드)             | 리소스 서버 (백엔드 API)                    |
| **발급자**    | Auth0                                  | Auth0                                       |
| **주요 용도** | 로그인 검증용 (`/api/v2/auth/login`)   | 보호된 API 호출용 (`/api/v2/members/me` 등) |

### ID Token

- **OIDC(OpenID Connect)** 표준에 의해 정의됨
- 사용자의 **신원 정보**를 담고 있음 (이름, 이메일, 프로필 사진 등)
- 항상 **서명된 JWT** 형식
- 백엔드에서 검증하여 **사용자 인증**에 사용

#### ID Token 예시 (JWT)

```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ii0tLS0ifQ.eyJuaWNrbmFtZSI6InFhLWdpZnRpZnktdGVzdC1tb2NrIiwibmFtZSI6InFhLWdpZnRpZnktdGVzdC1tb2NrQGdpZnRpZnkuYXBwIiwiZW1haWwiOiJxYS1naWZ0aWZ5LXRlc3QtbW9ja0BnaWZ0aWZ5LmFwcCIsInN1YiI6ImF1dGgwfDY5N2M1NTBhNzQ1ZGM0YWJkMzRmZWE5MSIsImlhdCI6MTczODQ4MjcwOCwiZXhwIjoxNzM4NTE4NzA4fQ.xxxxx
```

#### ID Token 디코딩 결과 (Payload)

```json
{
  "nickname": "qa-giftify-test-mock",
  "name": "qa-giftify-test-mock@giftify.app",
  "picture": "https://s.gravatar.com/avatar/...",
  "email": "qa-giftify-test-mock@giftify.app",
  "email_verified": false,
  "sub": "auth0|697c550a745dc4abd34fea91",
  "iat": 1738482708,
  "exp": 1738518708
}
```

### Access Token

- **OAuth 2.0** 표준에 의해 정의됨
- API 리소스에 대한 **접근 권한**을 부여
- JWT 또는 **Opaque Token** (암호화된 문자열) 형식 가능
- Auth0 설정에 따라 형식이 달라짐

#### ⚠️ 주의사항

Access Token이 **Opaque Token** 형식인 경우, 백엔드에서 JWT로 디코딩하려 하면 다음과 같은 에러가 발생합니다:

```
BadJwtException: An error occurred while attempting to decode the Jwt: Malformed token
```

또는 암호화된 JWT(JWE)인 경우:

```
BadJwtException: Encrypted JWT rejected: No JWE key selector is configured
```

---

## 올바른 API 호출 흐름

```
[1. 프론트엔드 로그인]
         ↓
[2. Auth0에서 ID Token + Access Token 발급]
         ↓
[3. POST /api/v2/auth/login] ← ID Token을 Body에 담아 전송
         ↓
[4. 백엔드가 ID Token 검증 → 회원 생성/조회 → 응답 반환]
         ↓
[5. 이후 보호된 API 호출] ← Access Token을 Authorization 헤더에 담아 사용
```

### 백엔드 로그인 API 호출 예시

```bash
curl -X POST http://localhost:8080/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{"idToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."}'
```

### 보호된 API 호출 예시

```bash
curl -X GET http://localhost:8080/api/v2/members/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

## 개발용 토큰 확인 엔드포인트

개발 및 테스트 시 ID Token과 Access Token을 확인할 수 있는 전용 API를 제공합니다.

### 엔드포인트

```
GET /api/dev/tokens
```

### 위치

```
src/app/api/dev/tokens/route.ts
```

### 사용 방법

1. 브라우저에서 **로그인** 완료
2. 다음 URL로 접속:
   ```
   http://localhost:3000/api/dev/tokens
   ```

### 응답 예시

```json
{
  "message": "⚠️ 개발용 토큰 정보입니다. 절대 외부에 노출하지 마세요!",
  "idToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "accessToken": "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0...",
  "expiresAt": 1738518708,
  "scope": "openid profile email",
  "user": {
    "nickname": "qa-giftify-test-mock",
    "name": "qa-giftify-test-mock@giftify.app",
    "email": "qa-giftify-test-mock@giftify.app",
    "sub": "auth0|697c550a745dc4abd34fea91"
  }
}
```

### ⚠️ 보안 주의사항

> **경고**: 이 엔드포인트는 개발 및 테스트 목적으로만 사용해야 합니다.
>
> - 프로덕션 배포 전에 **반드시** 환경 체크 로직을 추가하거나 파일을 삭제하세요
> - 토큰 정보를 외부에 노출하지 마세요
> - 커밋된 토큰이 있다면 즉시 폐기하세요

### 프로덕션 환경 보호 예시

프로덕션 환경에서 접근을 차단하려면 다음 코드를 추가하세요:

```typescript
export async function GET() {
  // 개발 환경에서만 동작
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This endpoint is only available in development mode" },
      { status: 403 },
    );
  }

  // ... 나머지 로직
}
```

---

## 프론트엔드에서 토큰 접근하기

### 서버 컴포넌트에서

```typescript
import { auth0 } from "@/lib/auth/auth0";

export default async function Page() {
  const session = await auth0.getSession();

  // ID Token
  const idToken = session?.tokenSet?.idToken;

  // Access Token
  const accessToken = session?.tokenSet?.accessToken;

  // 사용자 정보 (ID Token 디코딩 결과)
  const user = session?.user;
}
```

### API 라우트에서

```typescript
import { auth0 } from "@/lib/auth/auth0";

export async function GET() {
  const session = await auth0.getSession();

  const idToken = session?.tokenSet?.idToken;
  const accessToken = session?.tokenSet?.accessToken;
}
```

### Access Token만 필요한 경우

```typescript
import { auth0 } from "@/lib/auth/auth0";

const tokenResult = await auth0.getAccessToken();
const accessToken = tokenResult?.token;
```

---

## 관련 파일

| 파일                                   | 설명                                |
| -------------------------------------- | ----------------------------------- |
| `src/lib/auth/auth0.ts`                | Auth0 클라이언트 설정               |
| `src/app/api/dev/tokens/route.ts`      | 개발용 토큰 확인 API                |
| `src/app/api/proxy/[...path]/route.ts` | API 프록시 (Access Token 자동 주입) |
| `src/lib/api/authenticated-client.ts`  | 인증된 API 클라이언트               |

---

## 참고 자료

- [Auth0 - ID Tokens](https://auth0.com/docs/secure/tokens/id-tokens)
- [Auth0 - Access Tokens](https://auth0.com/docs/secure/tokens/access-tokens)
- [Auth0 Next.js SDK](https://github.com/auth0/nextjs-auth0)
- [JWT.io](https://jwt.io/) - JWT 디코딩 및 검증 도구
