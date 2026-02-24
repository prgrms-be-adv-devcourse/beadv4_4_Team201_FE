'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { getSellerProducts, type SellerProductSearchParams } from '@/lib/api/products';
import { resolveImageUrl } from '@/lib/image';
import { queryKeys } from '@/lib/query/keys';
import { Loader2, Plus, Edit2, Package, Search, X, ImageIcon, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import { ProfileLayout } from '@/components/layout/ProfileLayout';

const STATUS_LABELS: Record<string, string> = {
    DRAFT: '검토 중',
    ACTIVE: '판매 중',
    INACTIVE: '판매 중단',
    REJECTED: '거절됨',
};

const STATUS_COLORS: Record<string, string> = {
    DRAFT: 'bg-yellow-100 text-yellow-700',
    ACTIVE: 'bg-green-100 text-green-700',
    INACTIVE: 'bg-muted text-muted-foreground',
    REJECTED: 'bg-red-100 text-red-700',
};

const FILTER_STATUS_OPTIONS = [
    { value: '', label: '전체' },
    { value: 'ACTIVE', label: '판매 중' },
    { value: 'INACTIVE', label: '판매 중단' },
    { value: 'DRAFT', label: '검토 중' },
    { value: 'REJECTED', label: '거절됨' },
];

const SORT_OPTIONS = [
    { value: 'latest', label: '최신순' },
    { value: 'priceAsc', label: '가격 낮은순' },
    { value: 'priceDesc', label: '가격 높은순' },
];

const DEFAULT_FILTERS: SellerProductSearchParams = {
    keyword: '',
    minPrice: undefined,
    maxPrice: undefined,
    inStock: undefined,
    status: undefined,
    sort: 'latest',
    size: 10,
    page: 0,
};

export default function SellerProductsPage() {
    const router = useRouter();
    const [filters, setFilters] = useState<SellerProductSearchParams>(DEFAULT_FILTERS);
    const [applied, setApplied] = useState<SellerProductSearchParams>(DEFAULT_FILTERS);

    const { data, isLoading: isProductsLoading, isError } = useQuery({
        queryKey: queryKeys.sellerProducts(applied),
        queryFn: () => getSellerProducts(applied),
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setApplied({ ...filters, page: 0 });
    };

    const handleReset = () => {
        setFilters(DEFAULT_FILTERS);
        setApplied(DEFAULT_FILTERS);
    };

    const handlePageChange = (newPage: number) => {
        setApplied(prev => ({ ...prev, page: newPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSizeChange = (newSize: number) => {
        setFilters(f => ({ ...f, size: newSize }));
        setApplied(prev => ({ ...prev, size: newSize, page: 0 }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 페이지 번호 목록 계산 (ellipsis 포함)
    const getPageNumbers = (currentPage: number, totalPages: number): (number | '...')[] => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i);
        const pages: (number | '...')[] = [];
        const delta = 2;
        const left = currentPage - delta;
        const right = currentPage + delta;
        let lastAdded = -1;
        for (let i = 0; i < totalPages; i++) {
            if (i === 0 || i === totalPages - 1 || (i >= left && i <= right)) {
                if (lastAdded !== -1 && i - lastAdded > 1) pages.push('...');
                pages.push(i);
                lastAdded = i;
            }
        }
        return pages;
    };

    const products = data?.content ?? [];
    const hasActiveFilter = !!(applied.keyword || applied.minPrice || applied.maxPrice || applied.status || applied.inStock !== undefined || (applied.sort && applied.sort !== 'latest'));

    return (
        <ProfileLayout>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">내 상품 조회</h1>
                    <Link href="/seller/products/new">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            상품 등록
                        </Button>
                    </Link>
                </div>

                {/* Search Panel */}
                <form onSubmit={handleSearch} className="bg-muted/30 border border-border rounded-lg p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">상품명 검색</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={filters.keyword ?? ''}
                                    onChange={e => setFilters(f => ({ ...f, keyword: e.target.value }))}
                                    placeholder="검색어 입력"
                                    className="pl-9 h-9"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">판매 상태</Label>
                            <select
                                value={filters.status ?? ''}
                                onChange={e => setFilters(f => ({ ...f, status: (e.target.value || undefined) as any }))}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                {FILTER_STATUS_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">정렬 기준</Label>
                            <select
                                value={filters.sort ?? 'latest'}
                                onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                {SORT_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">최소 가격</Label>
                            <Input
                                type="number"
                                min={0}
                                onKeyDown={(e) => {
                                    if (e.key === '-') e.preventDefault();
                                }}
                                value={filters.minPrice === 0 ? '' : (filters.minPrice ?? '')}
                                onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value ? Math.max(0, Number(e.target.value)) : undefined }))}
                                placeholder="0"
                                className="h-9"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">최대 가격</Label>
                            <Input
                                type="number"
                                min={0}
                                onKeyDown={(e) => {
                                    if (e.key === '-') e.preventDefault();
                                }}
                                value={filters.maxPrice === 0 ? '' : (filters.maxPrice ?? '')}
                                onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value ? Math.max(0, Number(e.target.value)) : undefined }))}
                                placeholder="0"
                                className="h-9"
                            />
                        </div>
                        <div className="flex flex-col gap-2 pb-1">
                            <div className="flex items-center gap-2">
                                <input
                                    id="inStockOnly"
                                    type="checkbox"
                                    checked={filters.inStock === true}
                                    onChange={e => setFilters(f => ({ ...f, inStock: e.target.checked ? true : undefined }))}
                                    className="h-4 w-4 rounded border-gray-300 text-foreground focus:ring-foreground"
                                />
                                <Label htmlFor="inStockOnly" className="text-sm cursor-pointer font-normal">재고 있는 상품만</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    id="outOfStockOnly"
                                    type="checkbox"
                                    checked={filters.inStock === false}
                                    onChange={e => setFilters(f => ({ ...f, inStock: e.target.checked ? false : undefined }))}
                                    className="h-4 w-4 rounded border-gray-300 text-foreground focus:ring-foreground"
                                />
                                <Label htmlFor="outOfStockOnly" className="text-sm cursor-pointer font-normal">재고 없는 상품만</Label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        {hasActiveFilter && (
                            <Button type="button" variant="ghost" onClick={handleReset} className="text-muted-foreground">
                                <X className="h-4 w-4 mr-2" />
                                초기화
                            </Button>
                        )}
                        <Button type="submit">검색</Button>
                    </div>
                </form>

                {/* Product List */}
                {isProductsLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed rounded-lg bg-muted/20">
                        <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">{hasActiveFilter ? '검색 결과가 없습니다.' : '등록된 상품이 없습니다.'}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">총 {data?.totalElements}개의 상품</p>
                            <div className="flex items-center gap-2">
                                <Label className="text-xs font-medium text-muted-foreground">페이지당</Label>
                                {[5, 10].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => handleSizeChange(s)}
                                        className={cn(
                                            'h-7 px-2.5 rounded text-xs font-medium border transition-colors',
                                            applied.size === s
                                                ? 'bg-foreground text-background border-foreground'
                                                : 'bg-background text-muted-foreground border-border hover:border-foreground'
                                        )}
                                    >
                                        {s}개
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">상품 정보</th>
                                        <th className="px-2 py-3 text-right font-medium">가격</th>
                                        <th className="px-2 py-3 text-right font-medium">재고</th>
                                        <th className="px-0 py-3 text-center font-medium">상태</th>
                                        <th className="px-0 py-3 text-center font-medium">정보 수정</th>
                                        <th className="px-0 py-3 text-center font-medium">재고 이력</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded bg-muted flex-shrink-0 overflow-hidden border">
                                                        {product.imageKey ? (
                                                            /* eslint-disable-next-line @next/next/no-img-element */
                                                            <img
                                                                src={resolveImageUrl(product.imageKey)}
                                                                alt={product.name}
                                                                className="h-full w-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = '/images/placeholder-product.png';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center">
                                                                <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <Link href={`/products/${product.id}`} className="font-medium truncate hover:underline underline-offset-2 line-clamp-1">{product.name}</Link>

                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-2 py-3 text-right font-medium">{formatPrice(product.price)}</td>
                                            <td className="px-2 py-3 text-right">{product.stock.toLocaleString()}</td>
                                            <td className="px-0 py-3 text-center">
                                                <span className={cn(
                                                    "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium",
                                                    STATUS_COLORS[product.status] || "bg-muted text-muted-foreground"
                                                )}>
                                                    {STATUS_LABELS[product.status] || product.status}
                                                </span>
                                            </td>
                                            <td className="px-0 py-3 text-center">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => router.push(`/seller/products/edit?id=${product.id}`)}>
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </td>
                                            <td className="px-1 py-3 text-center">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => router.push(`/seller/products/stock?productId=${product.id}`)}>
                                                    <History className="h-3.5 w-3.5" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {data && data.totalPages > 1 && (() => {
                            const currentPage = applied.page ?? 0;
                            const totalPages = data.totalPages;
                            const pageNumbers = getPageNumbers(currentPage, totalPages);
                            return (
                                <div className="flex justify-center items-center gap-1 mt-6 flex-wrap">
                                    {/* 처음 */}
                                    <Button
                                        variant="outline" size="sm"
                                        onClick={() => handlePageChange(0)}
                                        disabled={currentPage === 0}
                                        className="h-8 px-2 text-xs"
                                    >처음</Button>

                                    {/* 이전 */}
                                    <Button
                                        variant="outline" size="sm"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 0}
                                        className="h-8 px-2 text-xs"
                                    >이전</Button>

                                    {/* 페이지 번호 */}
                                    {pageNumbers.map((p, idx) =>
                                        p === '...' ? (
                                            <span key={`ellipsis-${idx}`} className="h-8 w-8 flex items-center justify-center text-xs text-muted-foreground">…</span>
                                        ) : (
                                            <Button
                                                key={p}
                                                variant={currentPage === p ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handlePageChange(p)}
                                                className="h-8 w-8 p-0 text-xs"
                                            >
                                                {p + 1}
                                            </Button>
                                        )
                                    )}

                                    {/* 다음 */}
                                    <Button
                                        variant="outline" size="sm"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages - 1}
                                        className="h-8 px-2 text-xs"
                                    >다음</Button>

                                    {/* 끝 */}
                                    <Button
                                        variant="outline" size="sm"
                                        onClick={() => handlePageChange(totalPages - 1)}
                                        disabled={currentPage === totalPages - 1}
                                        className="h-8 px-2 text-xs"
                                    >끝</Button>
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>
        </ProfileLayout>
    );
}
