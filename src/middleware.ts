import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

export default withMiddlewareAuthRequired();

export const config = {
    matcher: [
        '/profile/:path*',
        '/wishlist/:path*',
        '/fundings/organized/:path*',
        '/fundings/participated/:path*',
        '/fundings/received/:path*',
        '/cart/:path*',
        '/checkout/:path*',
        '/wallet/:path*',
        // '/api/proxy/:path*', // Optional: Protect API Proxy routes via middleware too?
        // Usually API routes are protected by check inside the route handler or middleware.
        // Let's stick to page protection for now as requested by typical patterns.
    ],
};
