'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Loader2, X } from 'lucide-react';
import { useOrder } from '@/features/order/hooks/useOrders';

const PROCESSING_DELAY_MS = 1500;

const PAYMENT_METHOD_LABELS: Record<string, string> = {
    DEPOSIT: '지갑',
    CARD: '카드',
    KAKAO_PAY: '카카오페이',
    NAVER_PAY: '네이버페이',
    TOSS_PAY: '토스페이',
    ACCOUNT_TRANSFER: '계좌이체',
    BANK_TRANSFER: '은행이체',
    POINT: '포인트',
};

type Phase = 'processing' | 'fetching' | 'success' | 'error';

function CheckoutCompleteContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    const [phase, setPhase] = useState<Phase>('processing');
    const [fetchEnabled, setFetchEnabled] = useState(false);

    const { data: order, isLoading, isError, refetch } = useOrder(orderId || '', {
        enabled: !!orderId && fetchEnabled,
    });

    const fundingItems = useMemo(
        () => order?.items?.filter((item) => item.orderItemType === 'FUNDING_GIFT') || [],
        [order?.items]
    );

    useEffect(() => {
        if (!orderId) {
            router.replace('/');
            return;
        }

        const timer = setTimeout(() => {
            setPhase('fetching');
            setFetchEnabled(true);
        }, PROCESSING_DELAY_MS);

        return () => clearTimeout(timer);
    }, [orderId, router]);

    useEffect(() => {
        if (phase === 'fetching') {
            if (isError) {
                setPhase('error');
            } else if (order && !isLoading) {
                setPhase('success');
            }
        }
    }, [phase, isError, order, isLoading]);

    const handleClose = () => {
        router.push('/');
    };

    if (phase === 'processing' || phase === 'fetching') {
        return (
            <AppShell
                headerTitle="결제 완료"
                headerVariant="detail"
                hasBack={false}
                showBottomNav={false}
                hideHeaderActions
            >
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] gap-4 px-4 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" strokeWidth={1.5} />
                    <div className="space-y-1">
                        <p className="text-lg font-bold">결제를 확인하고 있어요</p>
                        <p className="text-sm text-muted-foreground">잠시만 기다려주세요</p>
                    </div>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell
            headerTitle="결제 완료"
            headerVariant="detail"
            hasBack={false}
            showBottomNav={false}
            hideHeaderActions
        >
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] gap-10 p-6 max-w-sm mx-auto text-center">
                <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mx-auto">
                        <CheckCircle className="h-12 w-12 text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold">결제가 완료되었습니다!</h2>
                        <p className="text-sm text-muted-foreground">
                            {fundingItems.length > 0
                                ? `${fundingItems.length}건의 펀딩 참여가 완료되었습니다.`
                                : '주문이 성공적으로 처리되었습니다.'}
                        </p>
                    </div>
                </div>

                <Button
                    className="w-full h-12 text-base font-bold"
                    onClick={() => router.push('/')}
                >
                    홈으로 돌아가기
                </Button>
            </div>
        </AppShell>
    );
}

export default function CheckoutCompletePage() {
    return (
        <Suspense fallback={
            <AppShell
                headerTitle="결제 완료"
                headerVariant="detail"
                hasBack={false}
                showBottomNav={false}
            >
                <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" strokeWidth={1.5} />
                </div>
            </AppShell>
        }>
            <CheckoutCompleteContent />
        </Suspense>
    );
}
