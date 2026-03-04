'use client';

import { useEffect, useState } from 'react';

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const shouldEnableMSW = process.env.NEXT_PUBLIC_API_MOCKING !== 'disabled' && 
    (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_API_MOCKING === 'enabled');

  const [mswReady, setMswReady] = useState(
    () => !shouldEnableMSW
  );

  useEffect(() => {
    if (shouldEnableMSW) {
      const initMSW = async () => {
        try {
          const { worker } = await import('@/mocks/browser');
          await worker.start({
            onUnhandledRequest: 'bypass',
            serviceWorker: {
              url: '/mockServiceWorker.js',
            },
          });
          setMswReady(true);
        } catch (error) {
          console.error('MSW initialization failed:', error);
          setMswReady(true);
        }
      };

      initMSW();
    }
  }, [shouldEnableMSW]);

  if (!mswReady) {
    return null;
  }

  return <>{children}</>;
}
