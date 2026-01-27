'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Globe, Users, Lock, ChevronDown, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Visibility = 'PUBLIC' | 'FRIENDS' | 'PRIVATE';

interface WishlistHeaderProps {
    isOwner: boolean;
    itemCount: number;
    visibility: Visibility;
    onVisibilityChange?: (v: Visibility) => void;
    ownerName?: string;
}

export function WishlistHeader({
    isOwner,
    itemCount,
    visibility,
    onVisibilityChange,
    ownerName
}: WishlistHeaderProps) {

    const visibilityConfig = {
        PUBLIC: { icon: Globe, label: '전체 공개' },
        FRIENDS: { icon: Users, label: '친구만 공개' },
        PRIVATE: { icon: Lock, label: '비공개' },
    };

    const { icon: VisIcon, label: visLabel } = visibilityConfig[visibility];

    return (
        <div className="flex flex-col gap-4 bg-background px-4 py-4 shadow-sm">
            {isOwner ? (
                // Owner View: Controls
                <div className="flex items-center justify-between">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-medium">
                                <VisIcon className="h-3.5 w-3.5" />
                                {visLabel}
                                <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => onVisibilityChange?.('PUBLIC')}>
                                <Globe className="mr-2 h-4 w-4" /> 전체 공개
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onVisibilityChange?.('FRIENDS')}>
                                <Users className="mr-2 h-4 w-4" /> 친구만 공개
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onVisibilityChange?.('PRIVATE')}>
                                <Lock className="mr-2 h-4 w-4" /> 비공개
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <span className="text-sm text-muted-foreground">
                        총 <span className="font-bold text-foreground">{itemCount}</span>개의 위시 아이템
                    </span>
                </div>
            ) : (
                // Visitor View: Profile Summary
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center text-lg">
                                {/* Placeholder Avatar */}
                                👤
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">{ownerName}님의 위시리스트</h2>
                                <p className="text-xs text-muted-foreground">친구</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon">
                            <Settings className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                        총 <span className="font-bold text-foreground">{itemCount}</span>개의 위시 아이템
                    </div>
                </div>
            )}
        </div>
    );
}
