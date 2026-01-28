import { auth0 } from '@/lib/auth/auth0';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API Proxy Route for Client Components
 *
 * Proxies API requests from client components with Auth0 access token attached.
 * This allows client components to make authenticated API calls without
 * exposing the access token to the client.
 *
 * Usage in Client Components:
 * ```typescript
 * // GET request
 * const response = await fetch('/api/proxy/fundings/123');
 * const data = await response.json();
 *
 * // POST request
 * const response = await fetch('/api/proxy/cart/items', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ fundingId: '123', amount: 5000 }),
 * });
 * ```
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function proxyRequest(
  req: NextRequest,
  method: string,
  paramsPromise: Promise<{ path: string[] }>
) {
  try {
    const session = await auth0.getSession();

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No access token available' },
        { status: 401 }
      );
    }

    const params = await paramsPromise;
    const accessToken = session.accessToken;
    const apiPath = params.path.join('/');
    const url = `${API_BASE_URL}/api/${apiPath}`;

    const headers: HeadersInit = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    let body: string | undefined;
    if (method !== 'GET' && method !== 'DELETE') {
      const requestBody = await req.json().catch(() => null);
      if (requestBody) {
        body = JSON.stringify(requestBody);
      }
    }

    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to proxy request' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, 'GET', params);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, 'POST', params);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, 'PATCH', params);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, 'DELETE', params);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(req, 'PUT', params);
}
