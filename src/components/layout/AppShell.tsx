'use client';

import { Header, HeaderVariant } from './Header';
import { cn } from '@/lib/utils';

interface AppShellProps {
    children: React.ReactNode;
    showHeader?: boolean;
    showBottomNav?: boolean; // Deprecated, to be removed
    headerVariant?: HeaderVariant;
    headerTitle?: string;
    hasBack?: boolean;
    hideHeaderActions?: boolean;
    headerRight?: React.ReactNode;
    className?: string;
}

export function AppShell({
    children,
    showHeader = true,
    // showBottomNav = false, // Removed
    headerVariant = 'main',
    headerTitle,
    hasBack,
    hideHeaderActions,
    headerRight,
    className,
}: AppShellProps) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            {showHeader && (
                <Header
                    variant={headerVariant}
                    title={headerTitle}
                    hasBack={hasBack}
                    hideActions={hideHeaderActions}
                    rightAction={headerRight}
                />
            )}

            <main
                className={cn(
                    'flex-1',
                    className
                )}
            >
                {children}
            </main>
        </div>
    );
}
