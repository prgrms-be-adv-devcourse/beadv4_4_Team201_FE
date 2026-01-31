'use client';

import { Button } from '@/components/ui/button';
import { Lock, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Access Denied View - 29cm Style
 * Clean minimal access denied page
 */
export function AccessDeniedView() {
    const router = useRouter();

    return (
        <div className="flex items-center justify-center min-h-[60vh] p-4">
            <div className="text-center max-w-sm">
                <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-6" strokeWidth={1} />

                <h3 className="text-lg font-semibold tracking-tight mb-2">
                    비공개 위시리스트
                </h3>
                <p className="text-sm text-muted-foreground mb-8">
                    이 위시리스트는 비공개로 설정되어 접근할 수 없습니다
                </p>

                <div className="space-y-3">
                    <Button
                        onClick={() => router.back()}
                        className="w-full"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" strokeWidth={1.5} />
                        뒤로 가기
                    </Button>

                    <Button
                        onClick={() => router.push('/')}
                        variant="outline"
                        className="w-full"
                    >
                        홈으로 가기
                    </Button>
                </div>
            </div>
        </div>
    );
}
