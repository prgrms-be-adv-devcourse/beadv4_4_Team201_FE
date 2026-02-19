'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Globe, Users, Lock, ChevronDown } from 'lucide-react';
import { WishlistVisibility } from '@/types/wishlist';
import { LucideIcon } from 'lucide-react';

interface WishlistHeaderProps {
    isOwner: boolean;
    itemCount: number;
    visibility: WishlistVisibility;
    onVisibilityChange?: () => void;
    ownerName?: string;
}

/**
 * Wishlist Header - 29cm Style
 * Clean header with visibility controls
 */
export function WishlistHeader({
    isOwner,
    itemCount,
    visibility,
    onVisibilityChange,
    ownerName
}: WishlistHeaderProps) {

    const visibilityConfig: Record<WishlistVisibility, { icon: LucideIcon; label: string }> = {
        PUBLIC: { icon: Globe, label: '전체 공개' },
        FRIENDS_ONLY: { icon: Users, label: '친구만' },
        PRIVATE: { icon: Lock, label: '비공개' },
    };

    const { icon: VisIcon, label: visLabel } = visibilityConfig[visibility];

    return (
        <div className="border-b border-border px-4 py-4 md:px-8">
            {isOwner ? (
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                            Wishlist
                        </p>
                        <p className="text-sm mt-1">
                            <span className="font-medium">{itemCount}</span>개의 아이템
                        </p>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-1 text-sm hover:opacity-60 transition-opacity">
                                <VisIcon className="h-4 w-4" strokeWidth={1.5} />
                                {visLabel}
                                <ChevronDown className="h-3 w-3" strokeWidth={1.5} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onVisibilityChange}>
                                공개 설정 변경
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ) : (
                <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        {ownerName}님의 Wishlist
                    </p>
                    <p className="text-sm mt-1">
                        <span className="font-medium">{itemCount}</span>개의 아이템
                    </p>
                </div>
            )}
        </div>
    );
}
