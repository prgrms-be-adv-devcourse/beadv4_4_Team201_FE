'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
    ChevronLeft,
    Search,
    X,
    ShoppingBag,
    User,
    Heart,
    Home,
    Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LoginButton } from '@/features/auth/components/LoginButton';
import { SignupButton } from '@/features/auth/components/SignupButton';
import { UserMenu } from '@/features/auth/components/UserMenu';
import { SearchOverlay } from '@/components/common/SearchOverlay';
import { useCart } from '@/features/cart/hooks/useCart';

export type HeaderVariant = 'main' | 'detail' | 'search';

interface HeaderProps {
    variant?: HeaderVariant;
    title?: string;
    hasBack?: boolean;
    onBack?: () => void;
    className?: string;
    // Search specific
    searchQuery?: string;
    onSearchChange?: (value: string) => void;
    onSearchSubmit?: () => void;
    onSearchClear?: () => void;
    // Slots for customization
    rightAction?: React.ReactNode;
}

export function Header({
    variant = 'main',
    title,
    hasBack = false,
    onBack,
    className,
    searchQuery = '',
    onSearchChange,
    onSearchSubmit,
    onSearchClear,
    rightAction,
}: HeaderProps) {
    const router = useRouter();
    const [isSearchOpen, setIsSearchOpen] = React.useState(false);

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    const renderContent = () => {
        switch (variant) {
            case 'detail':
                return (
                    <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-3">
                            {hasBack && (
                                <button
                                    onClick={handleBack}
                                    aria-label="Go back"
                                    className="p-1 hover:opacity-60 transition-opacity"
                                >
                                    <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
                                </button>
                            )}
                            {title && (
                                <h1 className="text-sm font-medium tracking-tight">{title}</h1>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="hover:opacity-60 transition-opacity"
                                aria-label="Search"
                            >
                                <Search className="h-5 w-5" strokeWidth={1.5} />
                            </button>
                            {rightAction || <NavigationIcons onSearchClick={() => setIsSearchOpen(true)} />}
                        </div>
                    </div>
                );

            case 'search':
                return (
                    <div className="flex w-full items-center gap-3">
                        <button
                            onClick={handleBack}
                            aria-label="Go back"
                            className="p-1 hover:opacity-60 transition-opacity"
                        >
                            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
                        </button>
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="검색어를 입력하세요"
                                className="w-full h-9 px-0 bg-transparent border-0 border-b border-border focus:border-foreground focus:outline-none text-sm"
                                value={searchQuery}
                                onChange={(e) => onSearchChange?.(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit?.()}
                                autoFocus
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={onSearchClear}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="h-4 w-4" strokeWidth={1.5} />
                                </button>
                            )}
                        </div>
                    </div>
                );

            case 'main':
            default:
                return <MainHeaderContent onSearchClick={() => setIsSearchOpen(true)} />;
        }
    };

    return (
        <>
            <header
                className={cn(
                    'sticky top-0 z-50 flex h-14 w-full items-center bg-background px-4 md:px-8 border-b border-border/50',
                    className
                )}
            >
                {renderContent()}
            </header>

            {/* Search Overlay */}
            <SearchOverlay
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />
        </>
    );
}

/**
 * Navigation Icons - Combined from BottomNav
 * 29cm minimal icon style
 */
function NavigationIcons({ onSearchClick }: { onSearchClick?: () => void }) {
    const { user, isLoading } = useAuth();
    const pathname = usePathname();
    const { data: cart } = useCart();

    const cartItemCount = user ? (cart?.items.length || 0) : 0;

    if (isLoading) {
        return <div className="h-5 w-5 animate-pulse rounded-full bg-muted" />;
    }

    return (
        <div className="flex items-center gap-4">
            {user ? (
                <>
                    {/* Wishlist */}
                    <Link
                        href="/wishlist"
                        className={cn(
                            "hover:opacity-60 transition-opacity hidden sm:block",
                            pathname.startsWith('/wishlist') && "opacity-100"
                        )}
                        aria-label="Wishlist"
                    >
                        <Heart className="h-5 w-5" strokeWidth={1.5} />
                    </Link>

                    {/* Cart with badge */}
                    <Link
                        href="/cart"
                        className={cn(
                            "hover:opacity-60 transition-opacity relative",
                            pathname.startsWith('/cart') && "opacity-100"
                        )}
                        aria-label="Cart"
                    >
                        <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
                        {cartItemCount > 0 && (
                            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-foreground px-1 text-[10px] text-background font-medium">
                                {cartItemCount > 99 ? '99+' : cartItemCount}
                            </span>
                        )}
                    </Link>

                    {/* Wallet */}
                    <Link
                        href="/wallet"
                        className={cn(
                            "hover:opacity-60 transition-opacity hidden sm:block",
                            pathname.startsWith('/wallet') && "opacity-100"
                        )}
                        aria-label="Wallet"
                    >
                        <Wallet className="h-5 w-5" strokeWidth={1.5} />
                    </Link>

                    {/* User Menu */}
                    <UserMenu />
                </>
            ) : (
                <div className="flex items-center gap-3">
                    <LoginButton />
                    <SignupButton />
                </div>
            )}
        </div>
    );
}

/**
 * Main Header Content - 29cm Editorial Style
 */
function MainHeaderContent({ onSearchClick }: { onSearchClick: () => void }) {
    return (
        <div className="flex w-full items-center justify-between">
            {/* Logo */}
            <Link
                href="/"
                className="text-lg font-semibold tracking-tight hover:opacity-60 transition-opacity"
            >
                Giftify
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
                <Link
                    href="/products"
                    className="text-sm font-medium hover:opacity-60 transition-opacity"
                >
                    PRODUCTS
                </Link>
                <Link
                    href="/fundings"
                    className="text-sm font-medium hover:opacity-60 transition-opacity"
                >
                    FUNDINGS
                </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onSearchClick}
                    className="hover:opacity-60 transition-opacity"
                    aria-label="Search"
                >
                    <Search className="h-5 w-5" strokeWidth={1.5} />
                </button>
                <NavigationIcons onSearchClick={onSearchClick} />
            </div>
        </div>
    );
}
