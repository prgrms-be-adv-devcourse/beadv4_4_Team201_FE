# Auth0 세션 및 인증 구조

## 개요

이 프로젝트는 Auth0를 사용하여 사용자 인증을 처리합니다. 서버를 재시작해도 로그인 상태가 유지되는 것은 브라우저 쿠키와 Auth0 세션 덕분입니다.

## 인증 흐름

```
사용자 로그인 요청
    ↓
Auth0 로그인 페이지로 리다이렉트
    ↓
Auth0에서 인증 완료
    ↓
콜백 URL로 리다이렉트 + 토큰 발급
    ↓
Next.js 서버가 세션 쿠키(appSession) 생성
    ↓
브라우저에 쿠키 저장 (HttpOnly)
```

## 로그인 유지 구조

### 1. 브라우저 쿠키 (HttpOnly Cookie)

Auth0는 로그인 시 브라우저에 **`appSession`** 쿠키를 저장합니다.

- 쿠키는 `AUTH0_SECRET` 환경 변수로 암호화됨
- 서버가 재시작해도 **브라우저의 쿠키는 그대로 유지**
- Next.js 서버는 쿠키를 복호화해서 세션 정보를 읽음
- `httpOnly: true` 설정으로 JavaScript에서 접근 불가 (XSS 방어)

### 2. Auth0 서버 세션

- Auth0 클라우드 서버에도 사용자 세션이 유지됨
- 브라우저에서 Auth0 도메인(`dev-xxx.auth0.com`)의 쿠키가 남아있음
- SSO(Single Sign-On) 세션으로 다른 서비스와 로그인 공유 가능

### 3. 세션 검증 흐름

```
사용자 요청
    → 브라우저가 appSession 쿠키 전송
    → Next.js 서버가 AUTH0_SECRET으로 복호화
    → 세션 유효성 확인 (만료 여부, 토큰 유효성)
    → 유효하면 로그인 상태 유지
```

## 세션 만료 설정

### 기본 설정

- **Absolute Lifetime**: 7일 (604800초) - 로그인 후 최대 유지 기간
- **Inactivity Timeout**: 1일 (86400초) - 비활동 시 만료 기간

### 설정 변경 방법

1. [Auth0 Dashboard](https://manage.auth0.com/) 접속
2. Applications → 해당 애플리케이션 선택
3. Settings 탭
4. "ID Token Expiration" 또는 Advanced Settings의 세션 설정 변경

또는 코드에서 설정:

```typescript
// src/lib/auth/auth0.ts
export const auth0 = new Auth0Client({
  session: {
    absoluteDuration: 60 * 60 * 24, // 24시간
    rollingDuration: 60 * 60, // 1시간 (비활동 시)
  },
});
```

## 로그아웃 방법

### 1. 웹에서 로그아웃

- 헤더의 **LOGOUT** 버튼 클릭
- 또는 `/auth/logout` URL 직접 접속

### 2. 쿠키 수동 삭제

- Chrome: 개발자 도구(F12) → Application → Cookies → `appSession` 삭제

### 3. 시크릿 모드

- 시크릿/프라이빗 브라우징 모드를 사용하면 브라우저 종료 시 쿠키 자동 삭제

## 관련 파일

- `/src/lib/auth/auth0.ts` - Auth0 클라이언트 설정
- `/src/app/auth/[auth0]/route.ts` - Auth0 라우트 핸들러
- `/.env.local` - Auth0 환경 변수 (AUTH0_SECRET, AUTH0_DOMAIN 등)

## 보안 고려사항

1. **AUTH0_SECRET**: 32바이트 이상의 랜덤 문자열 사용 권장

   ```bash
   openssl rand -hex 32
   ```

2. **HTTPS 사용**: 프로덕션에서는 반드시 HTTPS 사용 (쿠키 탈취 방지)

3. **토큰 갱신**: Access Token이 만료되면 Refresh Token으로 자동 갱신

## 참고 문서

- [Auth0 Next.js SDK 공식 문서](https://auth0.github.io/nextjs-auth0/)
- [Auth0 Session Management](https://auth0.com/docs/manage-users/sessions)
