'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        {
            label: '홈',
            href: '/',
            icon: Home,
            isActive: pathname === '/',
        },
        {
            label: '검색',
            href: '/products/search',
            icon: Search,
            isActive: pathname.startsWith('/products/search'),
        },
        {
            label: '장바구니',
            href: '/cart',
            icon: ShoppingCart,
            isActive: pathname.startsWith('/cart'),
            badge: 0, // TODO: Connect to cart store
        },
        {
            label: 'MY',
            href: '/profile',
            icon: User,
            isActive: pathname.startsWith('/profile'),
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background pb-safe">
            <div className="grid h-full grid-cols-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                                item.isActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-primary/70'
                            )}
                        >
                            <div className="relative">
                                <Icon
                                    className={cn(
                                        'h-6 w-6',
                                        item.isActive && 'fill-current'
                                    )}
                                />
                                {item.badge ? (
                                    <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] text-destructive-foreground">
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                ) : null}
                            </div>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
