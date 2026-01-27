'use client';

import { usePathname } from 'next/navigation';
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
    className?: string;
}

export function AppShell({
    children,
    showHeader = true,
    showBottomNav = true,
    headerVariant = 'main',
    headerTitle,
    hasBack,
    className,
}: AppShellProps) {
    const pathname = usePathname();

    // Hide BottomNav on detail pages automatically if needed, or control via props
    // For now, we rely on props, but we could add logic like:
    // const isDetailPage = pathname.split('/').length > 2;

    return (
        <div className="flex min-h-screen flex-col bg-background">
            {showHeader && (
                <Header
                    variant={headerVariant}
                    title={headerTitle}
                    hasBack={hasBack}
                />
            )}

            <main
                className={cn(
                    'flex-1 overflow-x-hidden',
                    // Add padding for fixed header/bottom nav
                    // Header height is h-14 (3.5rem)
                    // BottomNav height is h-16 (4rem)
                    // We don't apply padding-top here if Header is sticky (it is sticky in Header.tsx)
                    // But we need safe area handling
                    showBottomNav && 'pb-16',
                    className
                )}
            >
                {children}
            </main>

            {showBottomNav && <BottomNav />}
        </div>
    );
}
