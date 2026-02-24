'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Globe, Users, Lock, Check } from 'lucide-react';
import { WishlistVisibility } from '@/types/wishlist';
import { cn } from '@/lib/utils';

interface VisibilityDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentVisibility: WishlistVisibility;
    onVisibilityChange: (visibility: WishlistVisibility) => void;
}

const VISIBILITY_OPTIONS = [
    {
        value: 'PUBLIC' as WishlistVisibility,
        icon: Globe,
        label: '전체 공개',
        description: '모든 사람이 내 위시리스트를 볼 수 있습니다',
    },
    {
        value: 'FRIENDS_ONLY' as WishlistVisibility,
        icon: Users,
        label: '친구만 공개',
        description: '친구로 등록된 사람만 볼 수 있습니다',
    },
    {
        value: 'PRIVATE' as WishlistVisibility,
        icon: Lock,
        label: '비공개',
        description: '나만 볼 수 있습니다',
    },
];

export function VisibilityDialog({
    open,
    onOpenChange,
    currentVisibility,
    onVisibilityChange,
}: VisibilityDialogProps) {
    const [selectedVisibility, setSelectedVisibility] = useState(currentVisibility);

    const handleConfirm = () => {
        if (selectedVisibility !== currentVisibility) {
            onVisibilityChange(selectedVisibility);
        }
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
                <DialogHeader className="text-left">
                    <DialogTitle className="text-xl font-bold">공개 범위 설정</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        위시리스트를 누가 볼 수 있는지 선택하세요
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-2">
                    {VISIBILITY_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const isSelected = selectedVisibility === option.value;

                        return (
                            <button
                                key={option.value}
                                onClick={() => setSelectedVisibility(option.value)}
                                className={cn(
                                    'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left group',
                                    isSelected
                                        ? 'border-foreground bg-foreground/5'
                                        : 'border-border hover:border-foreground/50 hover:bg-muted'
                                )}
                            >
                                <div className={cn(
                                    'p-2 rounded-full transition-colors',
                                    isSelected ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground group-hover:text-foreground'
                                )}>
                                    <Icon className="h-5 w-5" />
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className={cn(
                                            "font-semibold transition-colors",
                                            isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                                        )}>
                                            {option.label}
                                        </h4>
                                        {isSelected && (
                                            <Check className="h-4 w-4 text-foreground" strokeWidth={3} />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {option.description}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-6 flex gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 rounded-xl h-12 font-medium"
                    >
                        취소
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        className="flex-1 rounded-xl h-12 font-bold bg-foreground text-background hover:bg-foreground/90 disabled:opacity-30"
                        disabled={selectedVisibility === currentVisibility}
                    >
                        변경하기
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
