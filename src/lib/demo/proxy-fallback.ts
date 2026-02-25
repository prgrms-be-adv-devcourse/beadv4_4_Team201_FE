import { getMockResponse } from './mock-data';

type Fetcher = () => Promise<Response>;

export async function tryFetchWithFallback(
  fetcher: Fetcher,
  method: string,
  path: string,
): Promise<Response> {
  try {
    const response = await fetcher();

    // 2xx = success, return as-is
    if (response.ok) {
      return response;
    }

    // Any non-2xx = try fallback (BE might be down, returning 404/500/etc.)
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
