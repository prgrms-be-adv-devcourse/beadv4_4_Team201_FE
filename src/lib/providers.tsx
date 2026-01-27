'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Auth0Provider } from '@auth0/nextjs-auth0/client';
import { Toaster } from 'sonner';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // With Next.js 14, by default, we want to avoid refetching immediately on the client
                        // unless explicit. Adjust staleTime as needed.
                        staleTime: 60 * 1000,
                    },
                },
            })
    );

    return (
        <Auth0Provider>
            <QueryClientProvider client={queryClient}>
                {children}
                <Toaster position="top-center" richColors />
            </QueryClientProvider>
        </Auth0Provider>
    );
}