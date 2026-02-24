'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Bell, ShoppingBag, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useCart } from '@/features/cart/hooks/useCart';
import { useUnreadCount } from '@/features/notification/hooks/useNotifications';

export function BottomNav() {
    const pathname = usePathname();
    const { user } = useUser();
    const { data: cart } = useCart();

    const { data: unreadCount } = useUnreadCount();
    const cartItemCount = user ? (cart?.items.length || 0) : 0;
    const notificationCount = user ? (unreadCount?.count || 0) : 0;

    const navItems = [
        {
            label: '홈',
            href: '/',
            icon: Home,
            isActive: pathname === '/',
        },
        {
            label: '검색',
            href: '/products',
            icon: Search,
            isActive: pathname === '/products',
        },
        {
            label: '알림',
            href: '/notifications',
            icon: Bell,
            isActive: pathname.startsWith('/notifications'),
            badge: notificationCount,
        },
        {
            label: '장바구니',
            href: '/cart',
            icon: ShoppingBag,
            isActive: pathname.startsWith('/cart'),
            badge: cartItemCount,
        },
        {
            label: '지갑',
            href: '/wallet',
            icon: Wallet,
            isActive: pathname.startsWith('/wallet'),
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background pb-safe md:hidden">
            <div className="grid h-14 grid-cols-5">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-opacity',
                                item.isActive
                                    ? 'text-foreground'
                                    : 'text-muted-foreground hover:text-foreground/80'
                            )}
                        >
                            <div className="relative">
                                <Icon
                                    className="h-5 w-5"
                                    strokeWidth={item.isActive ? 2 : 1.5}
                                />
                                {item.badge ? (
                                    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-foreground px-1 text-[10px] text-background font-medium">
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                ) : null}
                            </div>
                            <span className="text-[10px] tracking-tight">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
