import { getMockResponse } from './mock-data';

type Fetcher = () => Promise<Response>;

export async function tryFetchWithFallback(
  fetcher: Fetcher,
  method: string,
  path: string,
): Promise<Response> {
  try {
    const response = await fetcher();

    // 4xx = client error, return as-is (not a BE availability issue)
    // 2xx/3xx = success, return as-is
    if (response.status < 500) {
      return response;
    }

    // 5xx = server error, try fallback
    return fallbackOrError(method, path, `BE returned ${response.status}`);
  } catch {
    // Network error (ECONNREFUSED, timeout, etc.)
    return fallbackOrError(method, path, 'BE unreachable');
  }
}

function fallbackOrError(method: string, path: string, reason: string): Response {
  const mock = getMockResponse(method, path);

  if (mock) {
    console.log(`[Demo Fallback] ${method} ${path} — ${reason}, using mock data`);
    return new Response(JSON.stringify(mock.body), {
      status: mock.status,
      headers: {
        'Content-Type': 'application/json',
        'X-Demo-Fallback': 'true',
      },
    });
  }

  // No mock available
  return new Response(
    JSON.stringify({ message: `Service unavailable: ${reason}` }),
    {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    },
  );
}
