'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useQuery } from '@tanstack/react-query';

/**
 * Auth0 profile에서 role 가져오기
 * Auth0 Actions으로 role이 커스텀 클레임에 있거나,
 * /api/auth/profile 엔드포인트에서 확인
 */
async function fetchAuthProfile(): Promise<{ role?: string }> {
  const res = await fetch('/api/auth/profile');
  if (!res.ok) return {};
  return res.json();
}

/**
 * Custom Auth Hook
 *
 * Wrapper around useUser from @auth0/nextjs-auth0/client
 * Provides a consistent auth interface across the application.
 * Also exposes isSeller based on role from Auth0 claims or member API.
 */
export function useAuth() {
  const { user, error, isLoading } = useUser();

  const { data: authProfile } = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: fetchAuthProfile,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Auth0 claims에서 role 추출 (커스텀 클레임 네임스페이스 지원)
  const roleFromClaims =
    (user as Record<string, unknown> | undefined)?.[
    'https://giftify.app/role'
    ] as string | undefined ??
    (user as Record<string, unknown> | undefined)?.['role'] as string | undefined ??
    authProfile?.role;

  const isSeller = roleFromClaims === 'SELLER';

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user && !error,
    isSeller,
    role: roleFromClaims,
  };
}

