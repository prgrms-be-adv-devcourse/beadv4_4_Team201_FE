'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { Auth0Provider } from '@auth0/nextjs-auth0/client';
import { Toaster } from 'sonner';
import { AuthInitializer } from '@/features/auth/components/AuthInitializer';
import { NotificationSSEProvider } from '@/features/notification/components/NotificationSSEProvider';
import { getQueryClient } from '@/lib/query/get-query-client';

/**
 * Application Providers
 *
 * Wraps the application with necessary providers:
 * - Auth0Provider: Auth0 authentication context
 * - QueryClientProvider: TanStack Query for data fetching
 * - Toaster: Notification system
 */
export function Providers({ children }: { children: React.ReactNode }) {
    const queryClient = getQueryClient();

    return (
        <Auth0Provider>
            <AuthInitializer />
            <QueryClientProvider client={queryClient}>
                <NotificationSSEProvider />
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