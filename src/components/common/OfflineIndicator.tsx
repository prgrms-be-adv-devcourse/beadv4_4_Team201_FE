'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Offline indicator component
 * Shows a banner when the user is offline
 */
export function OfflineIndicator() {
    const [isOffline, setIsOffline] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check initial status
        setIsOffline(!navigator.onLine);

        const handleOnline = () => {
            setIsOffline(false);
            // Show "back online" message briefly
            setIsVisible(true);
            setTimeout(() => setIsVisible(false), 2000);
        };

        const handleOffline = () => {
            setIsOffline(true);
            setIsVisible(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Don't render if online and not showing message
    if (!isOffline && !isVisible) {
        return null;
    }

    return (
        <div
            className={cn(
                'fixed top-0 left-0 right-0 z-50 py-2 px-4 text-center text-sm font-medium transition-all duration-300',
                isOffline
                    ? 'bg-destructive text-destructive-foreground'
                    : 'bg-primary text-primary-foreground'
            )}
        >
            <div className="flex items-center justify-center gap-2">
                {isOffline ? (
                    <>
                        <WifiOff className="h-4 w-4" />
                        <span>오프라인 상태입니다</span>
                    </>
                ) : (
                    <span>다시 연결되었습니다</span>
                )}
            </div>
        </div>
    );
}
