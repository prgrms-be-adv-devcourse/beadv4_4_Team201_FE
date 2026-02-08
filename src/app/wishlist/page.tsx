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
import { Heart, ExternalLink, ChevronDown } from 'lucide-react';
import { useMyWishlist } from '@/features/wishlist/hooks/useWishlist';
import { useUpdateVisibility, useRemoveWishlistItem } from '@/features/wishlist/hooks/useWishlistMutations';
import { WishlistVisibility, WishItem } from '@/types/wishlist';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/format';

// Main tabs - 29cm style
const MAIN_TABS = [
    { label: '상품', value: 'product' },
    { label: '브랜드', value: 'brand' },
    { label: '마이셀렉션', value: 'myselection' },
    { label: '콘텐츠', value: 'content' },
];

// Category filters - 29cm style
const CATEGORY_FILTERS = [
    { label: '전체', value: '' },
    { label: '여성', value: 'women' },
    { label: '남성', value: 'men' },
    { label: '라이프스타일', value: 'lifestyle' },
    { label: '뷰티', value: 'beauty' },
    { label: '디지털', value: 'digital' },
];

// Status filters for Giftify
const STATUS_FILTERS = [
    { label: '전체', value: '' },
    { label: '펀딩 가능', value: 'AVAILABLE' },
    { label: '펀딩 진행중', value: 'IN_FUNDING' },
    { label: '펀딩 완료', value: 'FUNDED' },
];

// Price range filters
const PRICE_FILTERS = [
    { label: '전체', value: '' },
    { label: '~5만원', value: '0-50000' },
    { label: '5~10만원', value: '50000-100000' },
    { label: '10~30만원', value: '100000-300000' },
    { label: '30만원~', value: '300000-' },
];

export default function MyWishlistPage() {
    const router = useRouter();
    const { data: wishlist, isLoading, error } = useMyWishlist();
    const updateVisibility = useUpdateVisibility();
    const removeItem = useRemoveWishlistItem();

    const [activeTab, setActiveTab] = useState('product');
    const [activeCategory, setActiveCategory] = useState('');
    const [activeStatus, setActiveStatus] = useState('');
    const [activePriceRange, setActivePriceRange] = useState('');
    const [visibilitySheetOpen, setVisibilitySheetOpen] = useState(false);
    const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

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

    // Filter items - exclude items without valid product data
    const wishlistItems = (wishlist?.items || []).filter(item => item?.product?.id);
    const filteredItems = wishlistItems.filter(item => {
        // Status filter
        if (activeStatus && item.status !== activeStatus) return false;

        // Price range filter
        if (activePriceRange) {
            const [min, max] = activePriceRange.split('-').map(v => v ? parseInt(v) : null);
            const price = item.product.price;
            if (min !== null && price < min) return false;
            if (max !== null && price > max) return false;
        }

        return true;
    });

    // Count by status (using validated wishlistItems)
    const countByStatus = {
        '': wishlistItems.length,
        'AVAILABLE': wishlistItems.filter(i => i.status === 'AVAILABLE').length,
        'IN_FUNDING': wishlistItems.filter(i => i.status === 'IN_FUNDING').length,
        'FUNDED': wishlistItems.filter(i => i.status === 'FUNDED').length,
    };

    // Loading state
    if (isLoading) {
        return (
            <AppShell headerVariant="main">
                <div className="flex min-h-screen">
                    <aside className="hidden lg:block w-52 border-r border-border p-6">
                        <Skeleton className="h-6 w-16 mb-4" />
                        <div className="space-y-2">
                            {[1, 2, 3, 4].map(i => (
                                <Skeleton key={i} className="h-4 w-20" />
                            ))}
                        </div>
                    </aside>
                    <main className="flex-1 p-8">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i}>
                                    <Skeleton className="aspect-[3/4]" />
                                    <Skeleton className="h-3 w-16 mt-3" />
                                    <Skeleton className="h-4 w-full mt-2" />
                                    <Skeleton className="h-4 w-20 mt-2" />
                                </div>
                            ))}
                        </div>
                    </main>
                </div>
            </AppShell>
        );
    }

    // Error state
    if (error) {
        return (
            <AppShell headerVariant="main">
                <div className="flex items-center justify-center min-h-[50vh] p-4">
                    <div className="text-center space-y-2">
                        <p className="text-lg font-medium">위시리스트를 불러올 수 없습니다</p>
                        <p className="text-sm text-muted-foreground">잠시 후 다시 시도해주세요</p>
                        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
                            새로고침
                        </Button>
                    </div>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell headerVariant="main">
            <div className="flex min-h-screen">
                {/* Sidebar - 29cm Style */}
                <aside className="hidden lg:block w-52 flex-shrink-0 border-r border-border sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
                    <div className="p-6">
                        {/* Title */}
                        <h2 className="text-lg font-semibold tracking-tight mb-1">LIKE</h2>
                        <button
                            onClick={() => setVisibilitySheetOpen(true)}
                            className="text-[11px] text-muted-foreground hover:text-foreground mb-6 transition-colors flex items-center gap-1"
                        >
                            ♡ 마음에드는 상품 모음
                        </button>

                        {/* Main Tabs */}
                        <nav className="space-y-2 mb-8">
                            {MAIN_TABS.map((tab) => (
                                <button
                                    key={tab.value}
                                    onClick={() => setActiveTab(tab.value)}
                                    className={cn(
                                        'block text-sm transition-all w-full text-left py-0.5',
                                        activeTab === tab.value
                                            ? 'font-medium text-foreground'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>

                        {/* Category Filter - 29cm Style */}
                        <div className="border-t border-border pt-6 mb-6">
                            <button
                                onClick={() => setExpandedFilter(expandedFilter === 'category' ? null : 'category')}
                                className="flex items-center justify-between w-full text-xs text-muted-foreground mb-3"
                            >
                                <span>카테고리</span>
                                <ChevronDown className={cn(
                                    "h-3 w-3 transition-transform",
                                    expandedFilter === 'category' && "rotate-180"
                                )} />
                            </button>
                            {expandedFilter === 'category' && (
                                <nav className="space-y-2">
                                    {CATEGORY_FILTERS.map((cat) => (
                                        <button
                                            key={cat.value}
                                            onClick={() => setActiveCategory(cat.value)}
                                            className={cn(
                                                'block text-sm transition-all w-full text-left py-0.5',
                                                activeCategory === cat.value
                                                    ? 'font-medium text-foreground'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            )}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </nav>
                            )}
                        </div>

                        {/* Status Filter */}
                        <div className="border-t border-border pt-6 mb-6">
                            <p className="text-xs text-muted-foreground mb-3">펀딩 상태</p>
                            <nav className="space-y-2">
                                {STATUS_FILTERS.map((status) => (
                                    <button
                                        key={status.value}
                                        onClick={() => setActiveStatus(status.value)}
                                        className={cn(
                                            'block text-sm transition-all w-full text-left py-0.5',
                                            activeStatus === status.value
                                                ? 'font-medium text-foreground'
                                                : 'text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        {status.label}
                                        <span className="ml-1 text-[11px] text-muted-foreground">
                                            {countByStatus[status.value as keyof typeof countByStatus]}
                                        </span>
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Price Filter */}
                        <div className="border-t border-border pt-6 mb-6">
                            <button
                                onClick={() => setExpandedFilter(expandedFilter === 'price' ? null : 'price')}
                                className="flex items-center justify-between w-full text-xs text-muted-foreground mb-3"
                            >
                                <span>가격대</span>
                                <ChevronDown className={cn(
                                    "h-3 w-3 transition-transform",
                                    expandedFilter === 'price' && "rotate-180"
                                )} />
                            </button>
                            {expandedFilter === 'price' && (
                                <nav className="space-y-2">
                                    {PRICE_FILTERS.map((price) => (
                                        <button
                                            key={price.value}
                                            onClick={() => setActivePriceRange(price.value)}
                                            className={cn(
                                                'block text-sm transition-all w-full text-left py-0.5',
                                                activePriceRange === price.value
                                                    ? 'font-medium text-foreground'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            )}
                                        >
                                            {price.label}
                                        </button>
                                    ))}
                                </nav>
                            )}
                        </div>

                        {/* Visibility Setting */}
                        <div className="border-t border-border pt-6">
                            <p className="text-xs text-muted-foreground mb-3">공개설정</p>
                            <button
                                onClick={() => setVisibilitySheetOpen(true)}
                                className="px-3 py-2 border border-border text-xs w-full text-left hover:bg-secondary transition-colors"
                            >
                                {wishlist?.visibility === 'PUBLIC' ? '전체 공개' :
                                    wishlist?.visibility === 'FRIENDS_ONLY' ? '친구 공개' : '비공개'}
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 flex flex-col">
                    {/* Mobile Header */}
                    <div className="lg:hidden border-b border-border">
                        <div className="px-4 py-4">
                            <div className="flex items-center justify-between">
                                <h1 className="text-lg font-semibold">LIKE</h1>
                                <span className="text-sm text-muted-foreground">
                                    {wishlistItems.length}개
                                </span>
                            </div>
                        </div>

                        {/* Mobile Tabs */}
                        <div className="flex border-b border-border">
                            {MAIN_TABS.map((tab) => (
                                <button
                                    key={tab.value}
                                    onClick={() => setActiveTab(tab.value)}
                                    className={cn(
                                        'flex-1 py-3 text-sm text-center transition-all border-b-2 -mb-px',
                                        activeTab === tab.value
                                            ? 'font-medium border-foreground'
                                            : 'text-muted-foreground border-transparent'
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Mobile Status Filter */}
                        <div className="flex gap-4 px-4 py-3 overflow-x-auto scrollbar-hide">
                            {STATUS_FILTERS.map((status) => (
                                <button
                                    key={status.value}
                                    onClick={() => setActiveStatus(status.value)}
                                    className={cn(
                                        'text-sm whitespace-nowrap transition-all',
                                        activeStatus === status.value ? 'font-medium' : 'text-muted-foreground'
                                    )}
                                >
                                    {status.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 p-4 lg:p-8">
                        {filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Heart className="h-12 w-12 text-muted-foreground/50 mb-4" strokeWidth={1} />
                                <p className="text-muted-foreground mb-6">
                                    {activeStatus ? '해당 상태의 아이템이 없습니다' : '위시리스트가 비어있습니다'}
                                </p>
                                <Link href="/products">
                                    <Button variant="outline">상품 둘러보기</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                                {filteredItems.map((item) => (
                                    <WishItemCard29cm
                                        key={item.id}
                                        item={item}
                                        onDelete={() => handleDeleteItem(item.id)}
                                        onViewFunding={() => item.fundingId && handleViewFunding(item.fundingId)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <Footer />
                </main>
            </div>

            {/* Modals */}
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
 * 29cm Style Wish Item Card
 */
function WishItemCard29cm({
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
            {/* Image */}
            <Link href={`/products/${item.product.id}`}>
                <div className="relative aspect-[3/4] bg-secondary overflow-hidden">
                    {item.product.imageUrl ? (
                        <Image
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-muted-foreground/50 text-xs">No Image</span>
                        </div>
                    )}
                </div>
            </Link>

            {/* Heart Icon - Always visible */}
            <button
                onClick={onDelete}
                className="absolute top-3 right-3 transition-opacity"
                aria-label="Remove from wishlist"
            >
                <Heart className="h-5 w-5 fill-foreground text-foreground" strokeWidth={1.5} />
            </button>

            {/* Product Info - 29cm Style */}
            <div className="mt-3 space-y-1">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                    {item.product.brandName || 'Brand'}
                </p>
                <Link href={`/products/${item.product.id}`}>
                    <p className="text-sm line-clamp-2 hover:underline transition-all leading-relaxed">
                        {item.product.name}
                    </p>
                </Link>
                <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-sm font-medium">{formatPrice(item.product.price)}</span>
                </div>
            </div>

            {/* Status Badge & Action Buttons - 29cm Style */}
            <div className="mt-3 space-y-2">
                {item.status === 'IN_FUNDING' && (
                    <button
                        onClick={onViewFunding}
                        className="w-full py-2 border border-border text-xs hover:bg-secondary transition-colors flex items-center justify-center gap-1"
                    >
                        <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                        펀딩 보기
                    </button>
                )}
                {item.status === 'FUNDED' && (
                    <div className="w-full py-2 bg-secondary text-center text-xs text-muted-foreground">
                        펀딩 완료
                    </div>
                )}
            </div>
        </div>
    );
}
