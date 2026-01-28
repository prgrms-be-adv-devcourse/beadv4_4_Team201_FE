'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useOrder } from '@/features/order/hooks/useOrders';

function CheckoutCompleteContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    const { data: order, isLoading, isError } = useOrder(orderId || '');

    useEffect(() => {
        if (!orderId) {
            router.replace('/');
        }
    }, [orderId, router]);

    if (isLoading) {
        return (
            <AppShell
                headerTitle="결제 완료"
                headerVariant="detail"
                hasBack={false}
                showBottomNav={false}
            >
                <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </AppShell>
        );
    }

    if (isError || !order) {
        return (
            <AppShell
                headerTitle="결제 완료"
                headerVariant="detail"
                hasBack={false}
                showBottomNav={false}
            >
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] gap-4 p-4">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold mb-1">주문 정보를 찾을 수 없습니다</h3>
                        <p className="text-sm text-muted-foreground">
                            잠시 후 다시 시도해주세요.
                        </p>
                    </div>
                    <Button onClick={() => router.push('/')}>
                        홈으로 이동
                    </Button>
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
        >
            <div className="p-4 space-y-6 pb-24 max-w-lg mx-auto">
                <div className="flex flex-col items-center justify-center gap-4 py-8">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <CheckCircle className="h-10 w-10 text-primary" />
                    </div>
                    <div className="text-center space-y-1">
                        <h2 className="text-2xl font-bold">결제가 완료되었습니다!</h2>
                        <p className="text-sm text-muted-foreground">
                            펀딩 참여가 성공적으로 완료되었습니다.
                        </p>
                    </div>
                </div>

                <section className="space-y-4">
                    <h3 className="text-lg font-bold">주문 정보</h3>
                    <Card className="border-border bg-card">
                        <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">주문 번호</span>
                                <span className="font-mono text-xs">{order.id}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">주문 일시</span>
                                <span>{new Date(order.createdAt).toLocaleString('ko-KR')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">펀딩 참여</span>
                                <span>{order.itemCount}건</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>결제 금액</span>
                                <span className="text-primary">{order.totalAmount.toLocaleString()}원</span>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="space-y-4">
                    <h3 className="text-lg font-bold">펀딩 목록</h3>
                    <Card className="border-border bg-card">
                        <CardContent className="p-4 space-y-2">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span className="line-clamp-1">{item.funding.product.name}</span>
                                    <span className="ml-2 flex-shrink-0">{item.amount.toLocaleString()}원</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>

                <div className="flex flex-col gap-3 pt-4">
                    <Button
                        className="w-full h-12"
                        onClick={() => router.push('/fundings')}
                    >
                        펀딩 목록 보기
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full h-12"
                        onClick={() => router.push('/')}
                    >
                        홈으로 이동
                    </Button>
                </div>
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
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </AppShell>
        }>
            <CheckoutCompleteContent />
        </Suspense>
    );
}
