'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Menu,
    Bell,
    User,
    ChevronLeft,
    MoreHorizontal,
    Search,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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
                        <div className="flex items-center gap-2">
                            {hasBack && (
                                <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Go back">
                                    <ChevronLeft className="h-6 w-6" />
                                </Button>
                            )}
                            {title && <h1 className="text-lg font-semibold">{title}</h1>}
                        </div>
                        <div className="flex items-center gap-2">
                            {rightAction || (
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-6 w-6" />
                                </Button>
                            )}
                        </div>
                    </div>
                );

            case 'search':
                return (
                    <div className="flex w-full items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Go back">
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="상품명 검색..."
                                className="w-full bg-secondary pl-9 pr-8"
                                value={searchQuery}
                                onChange={(e) => onSearchChange?.(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit?.()}
                                autoFocus
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={onSearchClear}
                                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <Button variant="ghost" onClick={handleBack}>
                            취소
                        </Button>
                    </div>
                );

            case 'main':
            default:
                return (
                    <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" aria-label="Menu">
                                <Menu className="h-6 w-6" />
                            </Button>
                            <Link href="/" className="text-xl font-bold text-primary">
                                Giftify
                            </Link>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" aria-label="Notifications">
                                <Bell className="h-6 w-6" />
                            </Button>
                            <Link href="/profile">
                                <Button variant="ghost" size="icon" aria-label="Profile">
                                    <User className="h-6 w-6" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                );
        }
    };

    return (
        <header
            className={cn(
                'sticky top-0 z-50 flex h-14 w-full items-center border-b bg-background px-4 shadow-sm',
                className
            )}
        >
            {renderContent()}
        </header>
    );
}
