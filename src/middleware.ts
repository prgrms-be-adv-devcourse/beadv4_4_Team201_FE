import type { NextRequest } from 'next/server';
import { auth0 } from './lib/auth/auth0';

/**
 * Middleware for Auth0 authentication
 *
 * Handles authentication routes (/auth/*) and protects specific routes.
 * Protected routes: /cart, /checkout, /wallet, /profile, /wishlist
 *
 * IMPORTANT: This file must be at src/middleware.ts (NOT src/app/middleware.ts)
 */
export async function middleware(request: NextRequest) {
  return await auth0.middleware(request);
}

/**
 * Matcher configuration
 * Applies middleware to all routes except static files and images
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
