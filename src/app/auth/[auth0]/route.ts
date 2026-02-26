import { NextRequest, NextResponse } from 'next/server';

import { auth0 } from '@/lib/auth/auth0';

const DEMO_MODE = process.env.DEMO_MODE === 'true';

const DEMO_USER = {
  sub: 'demo|1',
  name: '데모 사용자',
  email: 'demo@giftify.app',
  picture: '/images/demo/default.jpg',
  nickname: '데모유저',
  email_verified: true,
};

export async function GET(req: NextRequest) {
  if (DEMO_MODE && req.nextUrl.pathname.endsWith('/me')) {
    return NextResponse.json(DEMO_USER);
  }
  return auth0.middleware(req);
}

export async function POST(req: NextRequest) {
  return auth0.middleware(req);
}
