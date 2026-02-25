import { auth0 } from '@/lib/auth/auth0';
import { NextRequest, NextResponse } from 'next/server';
import { tryFetchWithFallback } from '@/lib/demo/proxy-fallback';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const DEMO_MODE = process.env.DEMO_MODE === 'true';

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, (await params).path, 'GET');
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, (await params).path, 'POST');
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, (await params).path, 'PUT');
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, (await params).path, 'PATCH');
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, (await params).path, 'DELETE');
}

async function proxyRequest(req: NextRequest, path: string[], method: string) {
  const pathString = path.join('/');

  let accessToken: string | undefined;
  try {
    const tokenResult = await auth0.getAccessToken();
    accessToken = tokenResult?.token;
  } catch {
    // If no session exists or error getting token, proceed without it
  }

  const url = `${API_URL}/${pathString}${req.nextUrl.search}`;
  console.log(`[Proxy] Forwarding ${method} request to: ${url}`);

  const headers: HeadersInit = {};
  if (!['GET', 'HEAD'].includes(method)) {
    headers['Content-Type'] = 'application/json';
  }
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  const idempotencyKey = req.headers.get('Idempotency-Key');
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }

  const body = ['GET', 'HEAD'].includes(method) ? undefined : await req.text();

  if (DEMO_MODE) {
    const fallbackResponse = await tryFetchWithFallback(
      () => fetch(url, { method, headers, body }),
      method,
      pathString,
    );
    return new NextResponse(fallbackResponse.body, {
      status: fallbackResponse.status,
      headers: Object.fromEntries(fallbackResponse.headers.entries()),
    });
  }

  // Original proxy logic (no fallback)
  try {
    const response = await fetch(url, { method, headers, body });
    const data = await response.text();

    if (!response.ok) {
      console.error(`[Proxy] Error from upstream (${response.status}):`, data);
    }

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    try {
      const json = JSON.parse(data);
      return NextResponse.json(json, { status: response.status });
    } catch {
      return new NextResponse(data, { status: response.status });
    }
  } catch (error) {
    console.error('Proxy Error:', error);
    return NextResponse.json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
