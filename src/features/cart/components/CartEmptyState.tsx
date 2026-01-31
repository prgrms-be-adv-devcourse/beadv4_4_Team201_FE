'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

/**
 * Cart Empty State - 29cm Style
 * Minimal empty state with centered content
 */
export function CartEmptyState() {
    const router = useRouter();

    return (
        <div className="flex flex-1 flex-col items-center justify-center text-center py-24 px-8">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-6" strokeWidth={1} />
            <h3 className="text-lg font-semibold tracking-tight mb-1">
                장바구니가 비어있습니다
            </h3>
            <p className="text-sm text-muted-foreground mb-8">
                친구들의 펀딩에 참여해보세요
            </p>
            <Button variant="outline" onClick={() => router.push('/fundings')}>
                펀딩 둘러보기
            </Button>
        </div>
    );
}
