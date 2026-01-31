'use client';

import { Button } from '@/components/ui/button';
import { Gift, Plus } from 'lucide-react';

interface WishlistEmptyStateProps {
    onAddItem: () => void;
}

/**
 * Wishlist Empty State - 29cm Style
 * Clean, minimal empty state
 */
export function WishlistEmptyState({ onAddItem }: WishlistEmptyStateProps) {
    return (
        <div className="flex items-center justify-center min-h-[60vh] p-4">
            <div className="text-center max-w-sm">
                <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-6" strokeWidth={1} />

                <h3 className="text-lg font-semibold tracking-tight mb-2">
                    위시리스트가 비어있어요
                </h3>
                <p className="text-sm text-muted-foreground mb-8">
                    받고 싶은 선물을 추가하고 친구들과 함께 펀딩을 시작해보세요
                </p>

                <Button onClick={onAddItem} size="lg">
                    <Plus className="h-4 w-4 mr-1" strokeWidth={1.5} />
                    위시 추가하기
                </Button>
            </div>
        </div>
    );
}
