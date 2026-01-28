import { Auth0Client } from '@auth0/nextjs-auth0/server';

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
 * - AUTH0_AUDIENCE (optional)
 */
export const auth0 = new Auth0Client();

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
