'use client';

import { Header, HeaderVariant } from './Header';
import { BottomNav } from './BottomNav';
import { cn } from '@/lib/utils';

interface AppShellProps {
    children: React.ReactNode;
    showHeader?: boolean;
    showBottomNav?: boolean;
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
    showBottomNav = false,
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
                    // BottomNav height is h-14 (3.5rem) + safe area
                    showBottomNav && 'pb-14',
                    className
                )}
            >
                {children}
            </main>

            {showBottomNav && <BottomNav />}
        </div>
    );
}
