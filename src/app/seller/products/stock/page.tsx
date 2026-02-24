'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getSellerProducts, getStockHistory } from '@/lib/api/products';
import { cn } from '@/lib/utils';
import {
    Loader2, ChevronLeft, Package,
    TrendingUp, TrendingDown, Minus, Search, X, Edit2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProfileLayout } from '@/components/layout/ProfileLayout';

const CHANGE_TYPE_OPTIONS = [
    { label: '전체', value: '' },
    { label: '관리자 수동 조정', value: 'MANUAL_SYSTEM' },
    { label: '판매자 수동 수정', value: 'MANUAL_SELLER' },
    { label: '펀딩 성공 차감', value: 'ORDER_COMPLETED' },
    { label: '펀딩 취소/환불 복구', value: 'ORDER_REFUNDED' },
] as const;

const CHANGE_TYPE_LABEL: Record<string, string> = {
    MANUAL_SYSTEM: '관리자 수동 조정',
    MANUAL_SELLER: '판매자 수동 수정',
    ORDER_COMPLETED: '펀딩 성공 차감',
    ORDER_REFUNDED: '펀딩 취소/환불 복구',
};

type ChangeType = 'MANUAL_SYSTEM' | 'MANUAL_SELLER' | 'ORDER_COMPLETED' | 'ORDER_REFUNDED';

interface Applied {
    productId?: number;
    changeType?: ChangeType;
    fromDate?: string;
    toDate?: string;
    sort: string;
    page: number;
    size: number;
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const pages: (number | '...')[] = [0];
    const lo = Math.max(1, current - 2);
    const hi = Math.min(total - 2, current + 2);
    if (lo > 1) pages.push('...');
    for (let i = lo; i <= hi; i++) pages.push(i);
    if (hi < total - 2) pages.push('...');
    pages.push(total - 1);
    return pages;
}

export default function StockHistoryPage() {
    return (
        <Suspense fallback={
            <ProfileLayout>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </ProfileLayout>
        }>
            <StockHistoryContent />
        </Suspense>
    );
}

function StockHistoryContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initProductId = searchParams.get('productId') ? Number(searchParams.get('productId')) : undefined;

    // 필터 입력 상태
    const [selectedProductId, setSelectedProductId] = useState<number | undefined>(initProductId);
    const [changeType, setChangeType] = useState<string>('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [sort, setSort] = useState('DESC');

    // 실제 API에 적용된 상태
    const [applied, setApplied] = useState<Applied>({
        productId: initProductId,
        sort: 'DESC',
        page: 0,
        size: 10,
    });

    // 내 상품 목록 (상품 선택 드롭다운용)
    const { data: productPage } = useQuery({
        queryKey: ['sellerProducts', 'all'],
        queryFn: () => getSellerProducts({ size: 100 }),
    });

    // 재고 이력 조회
    const { data, isLoading } = useQuery({
        queryKey: ['stockHistory', applied],
        queryFn: () => getStockHistory({
            ...(applied.productId !== undefined ? { productId: applied.productId } : {}),
            ...(applied.changeType ? { changeType: applied.changeType } : {}),
            ...(applied.fromDate ? { fromDate: applied.fromDate } : {}),
            ...(applied.toDate ? { toDate: applied.toDate } : {}),
            sort: applied.sort,
            page: applied.page,
            size: applied.size,
        }),
        staleTime: 0,
    });

    const items = data?.content ?? [];
    const totalPages = data ? Math.ceil(data.totalElements / applied.size) : 0;

    const hasActiveFilter = !!(applied.productId || applied.changeType || applied.fromDate || applied.toDate);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setApplied(prev => ({
            productId: selectedProductId,
            changeType: changeType ? changeType as ChangeType : undefined,
            fromDate: fromDate || undefined,
            toDate: toDate || undefined,
            sort,
            page: 0,
            size: prev.size,
        }));
    };

    const handleReset = () => {
        setSelectedProductId(undefined);
        setChangeType('');
        setFromDate('');
        setToDate('');
        setSort('DESC');
        setApplied(prev => ({ sort: 'DESC', page: 0, size: prev.size }));
    };

    const currentProductName = applied.productId
        ? productPage?.content.find(p => p.id === applied.productId)?.name
        : undefined;

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('ko-KR', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });

    const DeltaIcon = ({ delta }: { delta: number }) => {
        if (delta > 0) return <TrendingUp className="h-4 w-4 text-green-500 flex-shrink-0" />;
        if (delta < 0) return <TrendingDown className="h-4 w-4 text-destructive flex-shrink-0" />;
        return <Minus className="h-4 w-4 text-muted-foreground flex-shrink-0" />;
    };

    return (
        <ProfileLayout>
            <div className="flex flex-col gap-6">
                {/* 헤더 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push('/seller/products')}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-semibold">재고 이력</h1>
                            {currentProductName && (
                                <p className="text-sm text-muted-foreground mt-0.5">{currentProductName}</p>
                            )}
                        </div>
                    </div>
                    {applied.productId && (
                        <div />
                    )}
                </div>

                {/* 필터 */}
                <form onSubmit={handleSearch} className="bg-muted/30 border border-border rounded-lg p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* 상품 선택 */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">상품 선택</Label>
                            <select
                                value={selectedProductId ?? ''}
                                onChange={e => setSelectedProductId(e.target.value ? Number(e.target.value) : undefined)}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <option value="">전체 상품</option>
                                {productPage?.content.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* 변동 유형 */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">변동 유형</Label>
                            <select
                                value={changeType}
                                onChange={e => setChangeType(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                {CHANGE_TYPE_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* 정렬 */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">정렬</Label>
                            <select
                                value={sort}
                                onChange={e => setSort(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <option value="DESC">최신순</option>
                                <option value="ASC">오래된순</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* 날짜 범위 */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">시작 날짜</Label>
                            <Input
                                type="date"
                                value={fromDate}
                                onChange={e => setFromDate(e.target.value)}
                                className="h-9"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">종료 날짜</Label>
                            <Input
                                type="date"
                                value={toDate}
                                onChange={e => setToDate(e.target.value)}
                                className="h-9"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        {hasActiveFilter && (
                            <Button type="button" variant="ghost" onClick={handleReset} className="text-muted-foreground">
                                <X className="h-4 w-4 mr-2" />
                                초기화
                            </Button>
                        )}
                        <Button type="submit">
                            <Search className="h-4 w-4 mr-2" />
                            검색
                        </Button>
                    </div>
                </form>

                {/* 목록 */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed rounded-lg bg-muted/20">
                        <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">재고 변동 이력이 없습니다.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                총 <span className="font-medium text-foreground">{data?.totalElements}</span>건
                            </p>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <span>페이지당</span>
                                {[10, 20].map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setApplied(a => ({ ...a, size: s, page: 0 }))}
                                        className={cn(
                                            'px-2 py-0.5 rounded text-xs border transition-colors',
                                            applied.size === s
                                                ? 'bg-foreground text-background border-foreground font-medium'
                                                : 'border-border hover:border-foreground/50'
                                        )}
                                    >
                                        {s}개
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="border rounded-lg overflow-hidden">
                            <div className="divide-y divide-border">
                                {items.map(item => (
                                    <div key={item.id} className="flex items-center justify-between px-5 py-4 hover:bg-muted/20 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                'h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0',
                                                item.delta > 0 ? 'bg-green-50' : item.delta < 0 ? 'bg-red-50' : 'bg-gray-50'
                                            )}>
                                                <DeltaIcon delta={item.delta} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    {(() => {
                                                        const name = productPage?.content.find(p => p.id === item.productId)?.name;
                                                        const label = CHANGE_TYPE_LABEL[item.changeType] ?? item.changeType;
                                                        return name ? `[${name}] ${label}` : label;
                                                    })()}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    재고 변화: {item.beforeStock} → {item.afterStock}개 · {formatDate(item.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                'text-sm font-bold tabular-nums',
                                                item.delta > 0 ? 'text-green-600' : item.delta < 0 ? 'text-destructive' : 'text-muted-foreground'
                                            )}>
                                                {item.delta > 0 ? `+${item.delta}` : item.delta}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => router.push(`/seller/products/edit?id=${item.productId}`)}
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 페이지네이션 */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-1">
                                <Button variant="outline" size="sm" disabled={applied.page === 0}
                                    onClick={() => setApplied(a => ({ ...a, page: 0 }))}>처음</Button>
                                <Button variant="outline" size="sm" disabled={applied.page === 0}
                                    onClick={() => setApplied(a => ({ ...a, page: a.page - 1 }))}>이전</Button>
                                {getPageNumbers(applied.page, totalPages).map((p, i) =>
                                    p === '...'
                                        ? <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">…</span>
                                        : <Button
                                            key={p}
                                            variant={p === applied.page ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setApplied(a => ({ ...a, page: p as number }))}
                                        >
                                            {(p as number) + 1}
                                        </Button>
                                )}
                                <Button variant="outline" size="sm" disabled={applied.page >= totalPages - 1}
                                    onClick={() => setApplied(a => ({ ...a, page: a.page + 1 }))}>다음</Button>
                                <Button variant="outline" size="sm" disabled={applied.page >= totalPages - 1}
                                    onClick={() => setApplied(a => ({ ...a, page: totalPages - 1 }))}>끝</Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </ProfileLayout>
    );
}
