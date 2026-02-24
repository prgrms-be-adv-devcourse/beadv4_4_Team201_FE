import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Order, OrderStatus } from '@/types/order';

const STATUS_LABEL: Record<OrderStatus, string> = {
    CREATED: '주문생성',
    PAID: '결제완료',
    PARTIAL_CONFIRMED: '부분확정',
    CONFIRMED: '주문확정',
    PARTIAL_CANCELING: '부분취소중',
    CANCELING: '취소처리중',
    PARTIAL_CANCELED: '부분취소',
    CANCELED: '주문취소',
};

const STATUS_STYLE: Record<OrderStatus, string> = {
    CREATED: 'bg-muted text-muted-foreground',
    PAID: 'bg-foreground/10 text-foreground',
    PARTIAL_CONFIRMED: 'bg-foreground/10 text-foreground',
    CONFIRMED: 'bg-muted text-muted-foreground',
    PARTIAL_CANCELING: 'bg-foreground/10 text-foreground',
    CANCELING: 'bg-foreground/10 text-foreground',
    PARTIAL_CANCELED: 'bg-muted text-muted-foreground',
    CANCELED: 'bg-muted text-muted-foreground',
};

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
}

interface OrderCardProps {
    order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
    return (
        <Link
            href={`/orders/${order.id}`}
            className="flex items-center justify-between py-4 border-b border-border"
        >
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">
                        {order.orderNumber}
                    </span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 text-[11px] font-medium rounded ${STATUS_STYLE[order.status]}`}>
                        {STATUS_LABEL[order.status]}
                    </span>
                </div>
                <p className="text-sm font-medium">
                    {order.quantity}건 · {order.totalAmount.toLocaleString()}원
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(order.createdAt)}
                </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
        </Link>
    );
}
