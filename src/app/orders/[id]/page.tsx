'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { InlineError } from '@/components/common/InlineError';
import { useOrder } from '@/features/order/hooks/useOrders';
import type { OrderStatus, OrderItemType, OrderItemStatus } from '@/types/order';

const PAYMENT_METHOD_LABELS: Record<string, string> = {
    DEPOSIT: '지갑',
    CARD: '카드',
    KAKAO_PAY: '카카오페이',
    NAVER_PAY: '네이버페이',
    TOSS_PAY: '토스페이',
    ACCOUNT_TRANSFER: '계좌이체',
    VIRTUAL_ACCOUNT: '가상계좌',
    BANK_TRANSFER: '은행이체',
    POINT: '포인트',
};

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
    CREATED: '주문생성',
    PAID: '결제완료',
    PARTIAL_CONFIRMED: '부분확정',
    CONFIRMED: '주문확정',
    PARTIAL_CANCELING: '부분취소중',
    CANCELING: '취소처리중',
    PARTIAL_CANCELED: '부분취소',
    CANCELED: '주문취소',
};

const ITEM_TYPE_LABEL: Record<OrderItemType, string> = {
    NORMAL_ORDER: '일반 주문',
    FUNDING_GIFT: '펀딩 선물',
    NORMAL_GIFT: '일반 선물',
};

const ITEM_STATUS_LABEL: Record<OrderItemStatus, string> = {
    CREATED: '생성',
    PAID: '결제완료',
    CANCELING: '취소중',
    CANCELED: '취소됨',
    CONFIRMED: '확정',
};

function formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { data, isLoading, isError, refetch } = useOrder(id);

    if (isLoading) {
        return (
            <AppShell headerTitle="주문 상세" headerVariant="detail" hasBack showBottomNav={false}>
                <div className="p-4 space-y-4">
                    <Skeleton className="h-40 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                </div>
            </AppShell>
        );
    }

    if (isError || !data) {
        return (
            <AppShell headerTitle="주문 상세" headerVariant="detail" hasBack showBottomNav={false}>
                <div className="py-12 flex flex-col items-center">
                    <InlineError
                        message="주문 정보를 불러올 수 없습니다."
                        onRetry={() => refetch()}
                    />
                </div>
            </AppShell>
        );
    }

    const { order, items } = data;
    const canCancel = order.status === 'PAID';

    return (
        <AppShell headerTitle="주문 상세" headerVariant="detail" hasBack showBottomNav={false}>
            <div className="p-4 space-y-6 pb-24">
                <section className="space-y-3">
                    <h3 className="text-lg font-bold">주문 정보</h3>
                    <Card className="border-border bg-card">
                        <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">주문번호</span>
                                <span className="font-mono text-xs">{order.orderNumber}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">주문상태</span>
                                <span className="font-medium">{ORDER_STATUS_LABEL[order.status]}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">결제수단</span>
                                <span>{PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">주문일시</span>
                                <span>{formatDateTime(order.createdAt)}</span>
                            </div>
                            {order.paidAt && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">결제일시</span>
                                    <span>{formatDateTime(order.paidAt)}</span>
                                </div>
                            )}
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>결제금액</span>
                                <span className="text-primary">{order.totalAmount.toLocaleString()}원</span>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="space-y-3">
                    <h3 className="text-lg font-bold">주문 아이템 ({items.length}건)</h3>
                    <div className="divide-y divide-border">
                        {items.map((item, index) => (
                            <div key={item.id} className="py-3 flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                            #{index + 1}
                                        </span>
                                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                            {ITEM_TYPE_LABEL[item.orderItemType]}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {ITEM_STATUS_LABEL[item.status]}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium mt-1">
                                        {item.amount.toLocaleString()}원
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="pt-4">
                    <Button
                        className="w-full h-12"
                        variant="outline"
                        disabled={!canCancel}
                        onClick={() => {
                            if (canCancel) {
                                router.push(`/orders/cancel?orderId=${order.id}`);
                            }
                        }}
                    >
                        {canCancel ? '주문 취소' : '취소 불가'}
                    </Button>
                </div>

                <Footer />
            </div>
        </AppShell>
    );
}
