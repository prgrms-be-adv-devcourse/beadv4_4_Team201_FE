'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AppShell } from '@/components/layout/AppShell';
import { Footer } from '@/components/layout/Footer';
import { VisibilitySheet } from '@/features/wishlist/components/VisibilitySheet';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, ExternalLink, Globe, Users, Lock, Settings2 } from 'lucide-react';
import { InlineError } from '@/components/common/InlineError';
import { useMyWishlist } from '@/features/wishlist/hooks/useWishlist';
import { useUpdateVisibility, useRemoveWishlistItem } from '@/features/wishlist/hooks/useWishlistMutations';
import { WishlistVisibility, WishItem } from '@/types/wishlist';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/format';

const PAGE_SIZE = 20;

// Category filters
const CATEGORIES = [
    { label: '전체', value: '' },
    { label: '전자기기', value: 'electronics' },
    { label: '뷰티', value: 'beauty' },
    { label: '패션', value: 'fashion' },
    { label: '리빙', value: 'living' },
    { label: '식품', value: 'foods' },
    { label: '완구', value: 'toys' },
    { label: '아웃도어', value: 'outdoor' },
    { label: '반려동물', value: 'pet' },
    { label: '주방', value: 'kitchen' },
];

// Status filters
const STATUS_FILTERS = [
    { label: '전체', value: '' },
    { label: '펀딩 가능', value: 'AVAILABLE' },
    { label: '펀딩 진행중', value: 'IN_FUNDING' },
    { label: '펀딩 완료', value: 'FUNDED' },
];

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

function VisibilityBadge({ visibility }: { visibility: WishlistVisibility }) {
    if (visibility === 'PUBLIC') {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                <Globe className="h-3 w-3" />
                전체 공개
            </span>
        );
    }
    if (visibility === 'FRIENDS_ONLY') {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                <Users className="h-3 w-3" />
                친구 공개
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
            <Lock className="h-3 w-3" />
            비공개
        </span>
    );
}

export default function MyWishlistPage() {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(0);
    const [activeStatus, setActiveStatus] = useState<string | ''>('');
    const [activeCategory, setActiveCategory] = useState('');

    const { data: wishlist, isLoading, error, refetch } = useMyWishlist({
        page: currentPage,
        size: PAGE_SIZE,
        status: activeStatus as any,
        category: activeCategory,
    });

    const updateVisibility = useUpdateVisibility();
    const removeItem = useRemoveWishlistItem();

    const [visibilitySheetOpen, setVisibilitySheetOpen] = useState(false);

    const handleVisibilityChange = async (visibility: WishlistVisibility) => {
        try {
            await updateVisibility.mutateAsync({ visibility });
            toast.success('공개 설정이 변경되었습니다');
        } catch {
            toast.error('공개 설정 변경에 실패했습니다');
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        try {
            await removeItem.mutateAsync(itemId);
            toast.success('위시 아이템이 삭제되었습니다');
        } catch {
            toast.error('삭제에 실패했습니다');
        }
    };

    const handleViewFunding = (fundingId: string) => {
        router.push(`/fundings/${fundingId}`);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // 아이템 섹션 상단으로 스크롤
        document.getElementById('wishlist-items-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const totalPages = wishlist?.page?.totalPages || 0;
    const totalItems = wishlist?.page?.totalElements || wishlist?.itemCount || 0;

    // Filter items - exclude items without valid product data
    const wishlistItems = (wishlist?.items || []).filter(item => item?.product?.id);

    // Loading state
    if (isLoading) {
        return (
            <AppShell headerVariant="main">
                <div className="max-w-screen-xl mx-auto px-6 py-10">
                    <div className="bg-card border border-border rounded-xl p-8 mb-10">
                        <Skeleton className="h-8 w-48 mb-4" />
                        <Skeleton className="h-5 w-72 mb-6" />
                    </div>
                    <div className="flex gap-10">
                        <div className="w-48 shrink-0 space-y-8">
                            <Skeleton className="h-40 w-full" />
                            <Skeleton className="h-40 w-full" />
                        </div>
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i}>
                                    <Skeleton className="aspect-[3/4]" />
                                    <Skeleton className="h-4 w-full mt-2" />
                                    <Skeleton className="h-4 w-20 mt-2" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <Footer />
            </AppShell>
        );
    }

    // Error state
    if (error) {
        return (
            <AppShell headerVariant="main">
                <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
                    <InlineError
                        message="위시리스트를 불러올 수 없습니다."
                        error={error}
                        onRetry={() => refetch()}
                    />
                </div>
            </AppShell>
        );
    }

    const visibilityLabel =
        wishlist?.visibility === 'PUBLIC' ? '전체 공개' :
            wishlist?.visibility === 'FRIENDS_ONLY' ? '친구 공개' : '비공개';

    return (
        <AppShell headerVariant="main">
            <div className="max-w-screen-xl mx-auto px-6 py-10">

                {/* ─── 상단: 위시리스트 정보 ─────────────────────────────── */}
                <section className="bg-card border border-border rounded-xl p-8 mb-10">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <Heart className="h-5 w-5 fill-foreground text-foreground" strokeWidth={1.5} />
                                <h1 className="text-2xl font-semibold tracking-tight">내 위시리스트</h1>
                            </div>

                            {wishlist?.member?.nickname && (
                                <p className="text-sm text-muted-foreground mb-4">
                                    {wishlist.member.nickname}의 위시리스트
                                </p>
                            )}

                            <div className="flex items-center gap-3 flex-wrap">
                                {wishlist?.visibility && (
                                    <VisibilityBadge visibility={wishlist.visibility} />
                                )}
                                <span className="text-xs text-muted-foreground">
                                    총 <strong className="text-foreground">{totalItems.toLocaleString()}</strong>개 상품
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col items-start sm:items-end gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setVisibilitySheetOpen(true)}
                                className="flex items-center gap-2 text-sm"
                            >
                                <Settings2 className="h-4 w-4" />
                                공개 설정 변경
                            </Button>
                            <p className="text-[11px] text-muted-foreground">
                                현재: <span className="font-medium text-foreground">{visibilityLabel}</span>
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-border mt-6 pt-5">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-xl font-bold">{totalItems.toLocaleString()}</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">전체</p>
                            </div>
                            <div>
                                <p className="text-xl font-bold">
                                    {wishlist?.visibility === 'PUBLIC' ? '전체 공개' :
                                        wishlist?.visibility === 'FRIENDS_ONLY' ? '친구 공개' : '비공개'}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">공개 범위</p>
                            </div>
                            <div>
                                <p className="text-xl font-bold">{totalPages > 0 ? totalPages : 1}</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">페이지</p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex flex-col md:flex-row gap-10">
                    {/* ─── 왼쪽: 세로 메뉴 (카테고리 & 상태) ────────────────────── */}
                    <aside className="w-full md:w-48 bg-card border border-border rounded-xl p-6 h-fit sticky top-24">
                        <div className="space-y-8">
                            {/* 카테고리 섹션 */}
                            <div>
                                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                                    카테고리
                                </h3>
                                <ul className="space-y-1">
                                    {CATEGORIES.map(cat => (
                                        <li key={cat.value}>
                                            <button
                                                onClick={() => {
                                                    setActiveCategory(cat.value);
                                                    setCurrentPage(0);
                                                }}
                                                className={cn(
                                                    'w-full text-left px-3 py-2 rounded-md text-[13px] transition-colors',
                                                    activeCategory === cat.value
                                                        ? 'bg-foreground text-background font-medium'
                                                        : 'text-muted-foreground hover:bg-muted font-medium'
                                                )}
                                            >
                                                {cat.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* 상태 섹션 */}
                            <div>
                                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                                    펀딩 상태
                                </h3>
                                <ul className="space-y-1">
                                    {STATUS_FILTERS.map(status => (
                                        <li key={status.value}>
                                            <button
                                                onClick={() => {
                                                    setActiveStatus(status.value);
                                                    setCurrentPage(0);
                                                }}
                                                className={cn(
                                                    'w-full text-left px-3 py-2 rounded-md text-[13px] transition-colors',
                                                    activeStatus === status.value
                                                        ? 'bg-foreground text-background font-medium'
                                                        : 'text-muted-foreground hover:bg-muted font-medium'
                                                )}
                                            >
                                                {status.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </aside>

                    {/* ─── 오른쪽: 위시리스트 아이템 ─────────────────────────────── */}
                    <section id="wishlist-items-section" className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold">
                                {activeCategory ? CATEGORIES.find(c => c.value === activeCategory)?.label : '전체 상품'}
                                <span className="ml-2 text-sm text-muted-foreground font-normal">
                                    {totalItems}개
                                </span>
                            </h2>
                            {totalPages > 1 && (
                                <span className="text-[11px] text-muted-foreground">
                                    {currentPage + 1} / {totalPages} 페이지
                                </span>
                            )}
                        </div>

                        {wishlistItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-xl bg-card/50">
                                <Heart className="h-12 w-12 text-muted-foreground/30 mb-4" strokeWidth={1} />
                                <p className="text-muted-foreground mb-6 text-sm">
                                    해당 조건의 아이템이 없습니다
                                </p>
                                <Link href="/products">
                                    <Button variant="outline" size="sm">상품 둘러보기</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
                                {wishlistItems.map((item) => (
                                    <WishItemCard
                                        key={item.id}
                                        item={item}
                                        onDelete={() => handleDeleteItem(item.id)}
                                        onViewFunding={() => item.fundingId && handleViewFunding(item.fundingId)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* 페이지네이션 */}
                        {!isLoading && totalPages > 1 && (
                            <div className="flex items-center justify-center gap-1 py-16">
                                <button
                                    disabled={currentPage === 0}
                                    onClick={() => handlePageChange(0)}
                                    className="px-3 py-1.5 text-[11px] font-medium border border-border rounded hover:border-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    처음
                                </button>
                                <button
                                    disabled={currentPage === 0}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    className="px-3 py-1.5 text-[11px] font-medium border border-border rounded hover:border-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    이전
                                </button>

                                {getPageNumbers(currentPage, totalPages).map((p, i) =>
                                    p === '...'
                                        ? <span key={`ellipsis-${i}`} className="px-2 text-[11px] text-muted-foreground">···</span>
                                        : <button
                                            key={p}
                                            onClick={() => handlePageChange(p as number)}
                                            className={cn(
                                                'px-3 py-1.5 text-[11px] font-medium border rounded transition-colors',
                                                p === currentPage
                                                    ? 'border-foreground bg-foreground text-background'
                                                    : 'border-border hover:border-foreground'
                                            )}
                                        >
                                            {(p as number) + 1}
                                        </button>
                                )}

                                <button
                                    disabled={currentPage >= totalPages - 1}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    className="px-3 py-1.5 text-[11px] font-medium border border-border rounded hover:border-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    다음
                                </button>
                                <button
                                    disabled={currentPage >= totalPages - 1}
                                    onClick={() => handlePageChange(totalPages - 1)}
                                    className="px-3 py-1.5 text-[11px] font-medium border border-border rounded hover:border-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    끝
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </div>

            <Footer />

            <VisibilitySheet
                open={visibilitySheetOpen}
                onOpenChange={setVisibilitySheetOpen}
                currentVisibility={wishlist?.visibility || 'PUBLIC'}
                onVisibilityChange={handleVisibilityChange}
            />
        </AppShell>
    );
}

/**
 * Wish Item Card
 */
function WishItemCard({
    item,
    onDelete,
    onViewFunding,
}: {
    item: WishItem;
    onDelete: () => void;
    onViewFunding: () => void;
}) {
    return (
        <div className="group relative">
            {/* 이미지 */}
            <Link href={`/products/${item.product.id}`}>
                <div className="relative aspect-[3/4] bg-secondary overflow-hidden rounded-lg">
                    {item.product.imageUrl ? (
                        <Image
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-muted-foreground/40 text-xs">No Image</span>
                        </div>
                    )}

                    {/* 상태 뱃지 */}
                    {item.status === 'IN_FUNDING' && (
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded">
                            펀딩중
                        </div>
                    )}
                    {item.status === 'FUNDED' && (
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-gray-600 text-white text-[9px] font-bold rounded">
                            완료
                        </div>
                    )}
                </div>
            </Link>

            {/* 하트 버튼 */}
            <button
                onClick={onDelete}
                className="absolute top-3 right-3 p-1.5 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                aria-label="위시리스트에서 제거"
            >
                <Heart className="h-4 w-4 fill-foreground text-foreground" strokeWidth={1.5} />
            </button>

            {/* 상품 정보 */}
            <div className="mt-3 space-y-0.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    {item.product.sellerNickname || item.product.brandName || 'Seller'}
                </p>
                <Link href={`/products/${item.product.id}`}>
                    <p className="text-xs line-clamp-2 hover:underline transition-all leading-relaxed">
                        {item.product.name}
                    </p>
                </Link>
                <p className="text-sm font-semibold pt-1">{formatPrice(item.product.price)}</p>
            </div>

            {/* 액션 버튼 */}
            {item.status === 'IN_FUNDING' && (
                <button
                    onClick={onViewFunding}
                    className="mt-2 w-full py-1.5 border border-border rounded text-[10px] font-medium hover:bg-secondary transition-colors flex items-center justify-center gap-1"
                >
                    <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                    펀딩 보기
                </button>
            )}
        </div>
    );
}
