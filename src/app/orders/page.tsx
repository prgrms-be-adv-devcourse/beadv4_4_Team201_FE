'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Footer } from '@/components/layout/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { InlineError } from '@/components/common/InlineError';
import { useOrders } from '@/features/order/hooks/useOrders';
import { OrderCard } from '@/features/order/components/OrderCard';

export default function OrdersPage() {
    const { data, isLoading, isError, refetch } = useOrders();

    return (
        <AppShell headerTitle="주문내역" headerVariant="detail" hasBack showBottomNav={false}>
            <div className="p-4">
                {isLoading && (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="py-4 border-b border-border space-y-2">
                                <Skeleton className="h-3 w-32" />
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        ))}
                    </div>
                )}

                {isError && (
                    <div className="py-12 flex flex-col items-center">
                        <InlineError
                            message="주문 내역을 불러올 수 없습니다."
                            onRetry={() => refetch()}
                        />
                    </div>
                )}

                {data && data.items.length === 0 && (
                    <div className="py-12 flex flex-col items-center gap-4">
                        <p className="text-sm text-muted-foreground">
                            주문 내역이 없습니다
                        </p>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/">홈으로 가기</Link>
                        </Button>
                    </div>
                )}

                {data && data.items.length > 0 && (
                    <div>
                        {data.items.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                )}

                <Footer />
            </div>
        </AppShell>
    );
}
