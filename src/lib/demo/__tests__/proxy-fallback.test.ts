import { describe, test, expect, vi } from 'vitest';
import { tryFetchWithFallback } from '../proxy-fallback';

describe('tryFetchWithFallback', () => {
  test('returns real response when BE succeeds', async () => {
    const realResponse = new Response(JSON.stringify({ result: 'SUCCESS', data: { id: 1 } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    const fetcher = vi.fn().mockResolvedValue(realResponse);

    const result = await tryFetchWithFallback(fetcher, 'GET', 'api/v2/members/me');

    expect(fetcher).toHaveBeenCalledOnce();
    expect(result.status).toBe(200);
    const body = await result.json();
    expect(body.data.id).toBe(1);
  });

  test('falls back to mock when BE returns 500', async () => {
    const errorResponse = new Response('Internal Server Error', { status: 500 });
    const fetcher = vi.fn().mockResolvedValue(errorResponse);

    const result = await tryFetchWithFallback(fetcher, 'GET', 'api/v2/members/me');

    expect(result.status).toBe(200);
    const body = await result.json();
    expect(body.data).toHaveProperty('nickname');
  });

  test('falls back to mock when BE is unreachable (network error)', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));

    const result = await tryFetchWithFallback(fetcher, 'GET', 'api/v2/wallet/balance');

    expect(result.status).toBe(200);
    const body = await result.json();
    expect(body.data).toHaveProperty('balance');
  });

  test('returns original error when no mock exists for failed endpoint', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));

    const result = await tryFetchWithFallback(fetcher, 'GET', 'api/v99/nonexistent');

    expect(result.status).toBe(503);
    const body = await result.json();
    expect(body.message).toContain('unavailable');
  });

  test('falls back to mock when BE returns 404 (app not running)', async () => {
    const notFoundResponse = new Response('404 page not found', { status: 404 });
    const fetcher = vi.fn().mockResolvedValue(notFoundResponse);

    const result = await tryFetchWithFallback(fetcher, 'GET', 'api/v2/members/me');

    // In demo mode, non-2xx with mock available = fallback
    expect(result.status).toBe(200);
    const body = await result.json();
    expect(body.data).toHaveProperty('nickname');
  });

  test('adds X-Demo-Fallback header when using mock data', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));

    const result = await tryFetchWithFallback(fetcher, 'GET', 'api/v2/carts');

    expect(result.headers.get('X-Demo-Fallback')).toBe('true');
  });

  test('does not add X-Demo-Fallback header for real responses', async () => {
    const realResponse = new Response('{}', { status: 200 });
    const fetcher = vi.fn().mockResolvedValue(realResponse);

    const result = await tryFetchWithFallback(fetcher, 'GET', 'api/v2/carts');

    expect(result.headers.get('X-Demo-Fallback')).toBeNull();
  });
});
