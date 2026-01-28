import { auth0 } from '../auth/auth0';
import { apiClient } from './client';

/**
 * Authenticated API Client Wrapper
 *
 * Creates an API client that automatically attaches Auth0 access token
 * to all requests.
 *
 * Usage in Server Components and Server Actions:
 * ```typescript
 * const client = await createAuthenticatedClient();
 * const data = await client.get('/api/fundings');
 * ```
 *
 * Usage in Client Components:
 * Use fetch to /api/proxy/* routes which handle auth server-side
 * ```typescript
 * const response = await fetch('/api/proxy/fundings/123');
 * const data = await response.json();
 * ```
 */
export async function createAuthenticatedClient() {
  const session = await auth0.getSession();

  if (!session?.accessToken) {
    throw new Error('No access token available. User may not be authenticated.');
  }

  const accessToken = session.accessToken;

  return {
    get: <T>(url: string) =>
      apiClient.get<T>(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    post: <T>(url: string, data: unknown) =>
      apiClient.post<T>(url, data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    patch: <T>(url: string, data: unknown) =>
      apiClient.patch<T>(url, data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    delete: <T>(url: string) =>
      apiClient.delete<T>(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    put: <T>(url: string, data: unknown) =>
      apiClient.put<T>(url, data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
  };
}
