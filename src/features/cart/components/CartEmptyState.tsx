'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

export function CartEmptyState() {
    const router = useRouter();

    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center p-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <div className="space-y-1">
                <h3 className="text-lg font-medium">장바구니가 비어있습니다</h3>
                <p className="text-sm text-muted-foreground">
                    친구들의 펀딩에 참여해보세요!
                </p>
            </div>
            <Button variant="outline" className="mt-4" onClick={() => router.push('/fundings')}>
                펀딩 둘러보기
            </Button>
        </div>
    );
}
