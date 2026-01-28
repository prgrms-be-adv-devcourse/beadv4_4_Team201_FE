'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Auth0Provider } from '@auth0/nextjs-auth0/client';
import { Toaster } from 'sonner';
import { useState } from 'react';
import { ApiError } from '@/lib/api/client';

/**
 * Determines if an error is retryable
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
    // Don't retry after 3 attempts
    if (failureCount >= 3) return false;

    // Don't retry client errors (4xx) except 408 (timeout) and 429 (rate limit)
    if (error instanceof ApiError) {
        const status = parseInt(error.code, 10);
        if (!isNaN(status) && status >= 400 && status < 500) {
            return status === 408 || status === 429;
        }
    }

    // Retry network errors and server errors
    return true;
}

/**
 * Application Providers
 *
 * Wraps the application with necessary providers:
 * - Auth0Provider: Auth0 authentication context
 * - QueryClientProvider: TanStack Query for data fetching
 * - Toaster: Notification system
 */
export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // With Next.js 14, by default, we want to avoid refetching immediately on the client
                        // unless explicit. Adjust staleTime as needed.
                        staleTime: 60 * 1000,
                        retry: shouldRetry,
                        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
                        refetchOnWindowFocus: false,
                    },
                    mutations: {
                        retry: shouldRetry,
                        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
                    },
                },
            })
    );

    return (
        <Auth0Provider>
            <QueryClientProvider client={queryClient}>
                {children}
                <Toaster
                    position="top-center"
                    richColors
                    closeButton
                    duration={4000}
                />
            </QueryClientProvider>
        </Auth0Provider>
    );
}