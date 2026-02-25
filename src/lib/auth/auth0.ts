import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';

/**
 * Auth0 Client Instance
 *
 * Creates and exports a singleton instance of the Auth0Client.
 * This client is used for server-side authentication operations.
 *
 * Configuration is read automatically from environment variables:
 * - AUTH0_DOMAIN
 * - AUTH0_CLIENT_ID
 * - AUTH0_CLIENT_SECRET
 * - AUTH0_SECRET
 * - APP_BASE_URL
 * - AUTH0_AUDIENCE (for API access tokens)
 */
export const auth0 = new Auth0Client({
  authorizationParameters: {
    scope: 'openid profile email',
    audience: process.env.AUTH0_AUDIENCE,
  },
  async onCallback(error, context, session) {
    // If there's an error or no session, redirect to home
    if (error || !session) {
      return NextResponse.redirect(new URL('/', APP_BASE_URL));
    }

    try {
      const idToken = session.tokenSet?.idToken;

      if (idToken) {
        // Call backend to check if this is a new user
        const response = await fetch(`${API_URL}/api/v2/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('[Auth0 Callback] Backend sync result:', data);

          // If new user, redirect to complete signup page
          if (data.isNewUser) {
            console.log('[Auth0 Callback] New user detected, redirecting to complete-signup');
            return NextResponse.redirect(new URL('/auth/complete-signup', APP_BASE_URL));
          }
        } else {
          console.error('[Auth0 Callback] Backend sync failed:', response.status);
        }
      }
    } catch (err) {
      console.error('[Auth0 Callback] Error during backend sync:', err);
    }

    // Default: redirect to home or original destination
    const returnTo = context.returnTo || '/';
    return NextResponse.redirect(new URL(returnTo, APP_BASE_URL));
  },
});

/**
 * Auth0 route paths
 */
export const auth0Routes = {
  login: '/auth/login',
  logout: '/auth/logout',
  callback: '/auth/callback',
  profile: '/auth/profile',
} as const;

/**
 * Protected routes that require authentication
 */
export const protectedRoutes = [
  '/cart',
  '/checkout',
  '/wallet',
  '/profile',
  '/wishlist',
  '/notifications',
] as const;

/**
 * Public routes that don't require authentication
 */
export const publicRoutes = [
  '/',
  '/products',
  '/fundings',
  '/auth',
] as const;
