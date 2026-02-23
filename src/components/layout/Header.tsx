'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft,
    Search,
    X,
    ShoppingBag,
    User,
    Heart,
    LogOut,
    Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LoginButton } from '@/features/auth/components/LoginButton';
import { SignupButton } from '@/features/auth/components/SignupButton';
import { SearchOverlay } from '@/components/common/SearchOverlay';
import { useCart } from '@/features/cart/hooks/useCart';
import { useWallet } from '@/features/wallet/hooks/useWallet';
import { formatPrice } from '@/lib/format';

export type HeaderVariant = 'main' | 'detail' | 'search';

interface HeaderProps {
    variant?: HeaderVariant;
    title?: string;
    hasBack?: boolean;
    onBack?: () => void;
    className?: string;
    searchQuery?: string;
    onSearchChange?: (value: string) => void;
    onSearchSubmit?: () => void;
    onSearchClear?: () => void;
    rightAction?: React.ReactNode;
    hideActions?: boolean;
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
    hideActions = false,
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

    // simplified mobile header or detail/search header
    const renderSimpleContent = () => {
        if (variant === 'search') {
            return (
                <div className="flex w-full items-center gap-3 h-14 px-4">
                    <button onClick={handleBack} className="p-1 hover:opacity-60">
                        <ChevronLeft className="h-6 w-6" strokeWidth={1.5} />
                    </button>
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="검색어를 입력하세요"
                            className="w-full h-9 px-0 bg-transparent border-0 border-b border-black focus:outline-none text-base"
                            value={searchQuery}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit?.()}
                            autoFocus
                        />
                        {searchQuery && (
                            <button onClick={onSearchClear} className="absolute right-0 top-1/2 -translate-y-1/2 p-1">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            );
        }

        if (variant === 'detail') {
            return (
                <div className="flex w-full items-center justify-between h-14 px-4 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                    <div className="flex items-center gap-3">
                        {hasBack && (
                            <button onClick={handleBack} className="p-1 hover:opacity-60">
                                <ChevronLeft className="h-6 w-6" strokeWidth={1.5} />
                            </button>
                        )}
                        {title && <h1 className="text-base font-medium">{title}</h1>}
                    </div>
                    {rightAction ? (
                        <div className="flex items-center">
                            {rightAction}
                        </div>
                    ) : !hideActions && (
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsSearchOpen(true)}>
                                <Search className="h-6 w-6" strokeWidth={1.5} />
                            </button>
                            <MobileNavigationIcons />
                        </div>
                    )}
                </div>
            );
        }

        // Default Main Header (Mobile View)
        return (
            <div className="flex md:hidden w-full items-center justify-between h-14 px-4 bg-white sticky top-0 z-50 border-b">
                <Link href="/" className="text-2xl font-bold tracking-tighter">
                    Giftify
                </Link>
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsSearchOpen(true)}>
                        <Search className="h-6 w-6" strokeWidth={1.5} />
                    </button>
                    <MobileNavigationIcons />
                </div>
            </div>
        );
    };

    return (
        <>
            {/* Desktop 3-Row Header */}
            {variant === 'main' && (
                <header className={cn('hidden md:block w-full bg-white z-50 sticky top-0', className)}>
                    <div className="border-b border-gray-100">
                        {/* Row 1: Top Bar */}
                        <div className="max-w-screen-2xl mx-auto px-8 h-10 flex items-center justify-between">
                            <Link href="/" className="text-lg font-bold tracking-widest">
                                Giftify
                            </Link>
                            <DesktopTopNav />
                        </div>
                    </div>

                    <div className="bg-white/95 backdrop-blur-sm">
                        {/* Row 2: Main Nav */}
                        <div className="max-w-screen-2xl mx-auto px-8 pt-6 pb-4 flex items-center justify-between">
                            <DesktopMainNav />
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="hover:opacity-60 transition-opacity"
                            >
                                <Search className="w-8 h-8" strokeWidth={1.5} />
                            </button>
                        </div>

                        {/* Row 3: Category Nav */}
                        <div className="max-w-screen-2xl mx-auto px-8 pb-4">
                            <DesktopCategoryNav />
                        </div>
                    </div>
                </header>
            )}

            {/* Mobile / Variant Header */}
            <div className="md:hidden">
                {renderSimpleContent()}
            </div>
            {variant !== 'main' && (
                <div className="hidden md:block">
                    {renderSimpleContent()}
                </div>
            )}


            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}

// --- Sub Components ---

function DesktopTopNav() {
    const { user } = useAuth();
    // Only fetch cart/wallet if user is logged in. 
    // The hooks themselves (useCart, useWallet) already have `enabled: !!user` checks,
    // so `data` will be undefined if not logged in.
    const { data: cart } = useCart();
    const { data: wallet } = useWallet();
    
    // Safety check: only show count if user exists
    const cartCount = user && cart ? cart.items.length : 0;

    return (
        <div className="flex items-center gap-6 text-[10px] font-medium tracking-tight text-gray-900">
            {user ? (
                <>
                    <Link href="/u/me" className="flex items-center gap-1 hover:opacity-60 transition-opacity">
                        <User className="w-3 h-3" />
                        MY PAGE
                    </Link>
                    <Link href="/wallet" className="flex items-center gap-1 hover:opacity-60 transition-opacity">
                        <Wallet className="w-3 h-3" />
                        {formatPrice(wallet?.balance || 0)}
                    </Link>
                    <Link href="/wishlist" className="flex items-center gap-1 hover:opacity-60 transition-opacity">
                        <Heart className="w-3 h-3" />
                        MY LIKE
                    </Link>
                    <Link href="/cart" className="flex items-center gap-1 hover:opacity-60 transition-opacity relative">
                        <ShoppingBag className="w-3 h-3" />
                        CART
                        {cartCount > 0 && (
                            <span className="bg-[#ff4800] text-white text-[9px] rounded-full min-w-[14px] h-[14px] flex items-center justify-center -ml-0.5 -mt-2">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                    <a href="/auth/logout" className="flex items-center gap-1 hover:opacity-60 transition-opacity">
                        <LogOut className="w-3 h-3" />
                        LOGOUT
                    </a>
                </>
            ) : (
                <div className="flex gap-4">
                    <LoginButton />
                    <SignupButton />
                </div>
            )}
        </div>
    );
}

function DesktopMainNav() {
    return (
        <nav className="flex items-center gap-10">
            <Link href="/products" className="text-4xl font-extrabold tracking-tight hover:text-gray-600 transition-colors">
                PRODUCT
            </Link>
            <Link href="/explore" className="text-4xl font-extrabold tracking-tight hover:text-gray-600 transition-colors">
                DISCOVER
            </Link>
        </nav>
    );
}

const GIFT_CATEGORIES_DATA = [
    { label: 'ELECTRONICS', value: 'ELECTRONICS', subCategories: ['Audio', 'Mobile', 'Gaming', 'Cameras', 'Appliances'] },
    { label: 'BEAUTY', value: 'BEAUTY', subCategories: ['Skincare', 'Makeup', 'Perfume', 'Body & Hair', 'Grooming'] },
    { label: 'FASHION', value: 'FASHION', subCategories: ['Clothing', 'Bags', 'Wallets', 'Shoes', 'Jewelry'] },
    { label: 'LIVING', value: 'LIVING', subCategories: ['Furniture', 'Lighting', 'Fabric', 'Home Decor', 'Candles'] },
    { label: 'FOODS', value: 'FOODS', subCategories: ['Coffee & Tea', 'Bakery', 'Fresh Food', 'Wine & Spirits', 'Snacks'] },
    { label: 'TOYS', value: 'TOYS', subCategories: ['Figures', 'Board Games', 'Plushies', 'DIY Kits', 'Stationery'] },
    { label: 'OUTDOOR', value: 'OUTDOOR', subCategories: ['Camping', 'Hiking', 'Golf', 'Biking', 'Sports'] },
    { label: 'PET', value: 'PET', subCategories: ['Dogs', 'Cats', 'Food', 'Toys', 'Accessories'] },
    { label: 'KITCHEN', value: 'KITCHEN', subCategories: ['Tableware', 'Cookware', 'Kitchen Tools', 'Storage', 'Appliance'] },
];

function DesktopCategoryNav() {
    const [hoveredCategory, setHoveredCategory] = React.useState<string | null>(null);

    return (
        <div
            className="flex flex-col relative"
            onMouseLeave={() => setHoveredCategory(null)}
        >
            {/* Category List */}
            <div className="flex items-center gap-6 border-t border-black pt-4 pb-1 relative z-20 bg-white">
                {GIFT_CATEGORIES_DATA.map(cat => (
                    <Link
                        key={cat.label}
                        href={`/products?category=${cat.label.toLowerCase()}`}
                        className={cn(
                            "text-sm font-bold transition-all duration-200 pb-1 border-b-[3px] border-transparent",
                            hoveredCategory === cat.label
                                ? "border-black text-black"
                                : "hover:text-gray-500"
                        )}
                        onMouseEnter={() => setHoveredCategory(cat.label)}
                    >
                        {cat.label}
                    </Link>
                ))}
                <div className="w-px h-3 bg-gray-300 mx-2" />
                <Link href="/events" className="text-sm font-serif italic hover:text-gray-500 transition-colors">Event</Link>
                <Link href="/lookbook" className="text-sm font-serif italic hover:text-gray-500 transition-colors">Trend</Link>
            </div>

            {/* Mega Menu Dropdown */}
            <div
                className={cn(
                    "absolute top-full left-0 w-full bg-white transition-all duration-300 ease-out overflow-hidden z-10",
                    hoveredCategory ? "max-h-64 opacity-100 border-b border-gray-100 shadow-sm" : "max-h-0 opacity-0"
                )}
            >
                {hoveredCategory && (
                    <div className="py-6 flex flex-col flex-wrap h-48 content-start gap-x-12 gap-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Find the active category data */}
                        {GIFT_CATEGORIES_DATA.find(c => c.label === hoveredCategory)?.subCategories.map(sub => (
                            <Link
                                key={sub}
                                href={`/products?category=${hoveredCategory.toLowerCase()}&sub=${sub.toLowerCase()}`}
                                className="text-sm text-gray-500 hover:text-black hover:underline underline-offset-4"
                            >
                                {sub}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function MobileNavigationIcons() {
    const { data: cart } = useCart();
    const cartCount = cart?.items.length || 0;

    return (
        <div className="flex items-center gap-3">
            <Link href="/wallet">
                <Wallet className="w-6 h-6" strokeWidth={1.5} />
            </Link>
            <Link href="/cart" className="relative">
                <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />
                {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#ff4800] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                        {cartCount}
                    </span>
                )}
            </Link>
            <Link href="/u/me">
                <User className="w-6 h-6" strokeWidth={1.5} />
            </Link>
        </div>
    );
}
