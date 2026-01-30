import { apiClient } from './client';
import type { Member, LoginResponse } from '@/types/member';

export interface LoginRequest {
  idToken: string;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>('/api/auth/login', data);
}

export async function logout(): Promise<void> {
  return apiClient.post<void>('/api/auth/logout', {});
}

export async function getMe(): Promise<Member> {
  return apiClient.get<Member>('/api/v2/members/me');
}

/**
 * Synchronize Auth0 session with Backend
 * Calls the Next.js API route which forwards the ID Token to the backend.
 */
// Calls the Next.js API route (BFF) which forwards the ID Token to the backend.
export async function sync(): Promise<LoginResponse> {
  const response = await fetch('/api/auth/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to sync session');
  }

  return response.json();
}
