import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth/auth0';

/**
 * GET /api/auth/profile
 * Auth0 session에서 현재 유저 클레임 반환 (role 등 포함)
 */
export async function GET() {
    try {
        const session = await auth0.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }
        return NextResponse.json(session.user);
    } catch {
        return NextResponse.json({ error: 'Failed to get session' }, { status: 500 });
    }
}
