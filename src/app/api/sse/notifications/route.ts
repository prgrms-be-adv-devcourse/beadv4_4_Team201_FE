import { auth0 } from '@/lib/auth/auth0';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const dynamic = 'force-dynamic';

export async function GET() {
  let accessToken: string | undefined;

  try {
    const tokenResult = await auth0.getAccessToken();
    accessToken = tokenResult?.token;
  } catch {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!accessToken) {
    return new Response('Unauthorized', { status: 401 });
  }

  const upstream = await fetch(`${API_URL}/api/v1/notifications/subscribe`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'text/event-stream',
    },
  });

  if (!upstream.ok || !upstream.body) {
    return new Response('Failed to connect to notification stream', {
      status: upstream.status,
    });
  }

  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
