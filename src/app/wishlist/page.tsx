'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AppShell } from '@/components/layout/AppShell';
import { VisibilitySheet } from '@/features/wishlist/components/VisibilitySheet';
import { CreateFundingModal } from '@/features/funding/components/CreateFundingModal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Trash2, ExternalLink, Gift } from 'lucide-react';
import { useMyWishlist } from '@/features/wishlist/hooks/useWishlist';
import { useUpdateVisibility, useRemoveWishlistItem } from '@/features/wishlist/hooks/useWishlistMutations';
import { WishlistVisibility, WishItem } from '@/types/wishlist';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/format';

// Sidebar menu items
const SIDEBAR_MENU = [
    { label: '전체', filter: '' },
    { label: '펀딩 가능', filter: 'AVAILABLE' },
    { label: '펀딩 진행중', filter: 'IN_FUNDING' },
    { label: '펀딩 완료', filter: 'FUNDED' },
];

export default function MyWishlistPage() {
    const router = useRouter();
    const { data: wishlist, isLoading, error } = useMyWishlist();
    const updateVisibility = useUpdateVisibility();
    const removeItem = useRemoveWishlistItem();

    const [activeFilter, setActiveFilter] = useState('');
    const [visibilitySheetOpen, setVisibilitySheetOpen] = useState(false);
    const [fundingModalOpen, setFundingModalOpen] = useState(false);
    const [selectedWishItem, setSelectedWishItem] = useState<WishItem | null>(null);

    const handleVisibilityChange = async (visibility: WishlistVisibility) => {
        try {
            await updateVisibility.mutateAsync({ visibility });
            toast.success('공개 설정이 변경되었습니다');
        } catch {
            toast.error('공개 설정 변경에 실패했습니다');
        }
    };

    const handleStartFunding = (item: WishItem) => {
        setSelectedWishItem(item);
        setFundingModalOpen(true);
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

    // Filter items
    const filteredItems = wishlist?.items.filter(item => {
        if (!activeFilter) return true;
        return item.status === activeFilter;
    }) || [];

    // Count by status
    const countByStatus = {
        '': wishlist?.items.length || 0,
        'AVAILABLE': wishlist?.items.filter(i => i.status === 'AVAILABLE').length || 0,
        'IN_FUNDING': wishlist?.items.filter(i => i.status === 'IN_FUNDING').length || 0,
        'FUNDED': wishlist?.items.filter(i => i.status === 'FUNDED').length || 0,
    };

    // Loading state
    if (isLoading) {
        return (
            <AppShell headerVariant="main">
                <div className="flex min-h-screen">
                    <aside className="hidden lg:block w-48 border-r border-border p-6">
                        <Skeleton className="h-6 w-20 mb-8" />
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map(i => (
                                <Skeleton key={i} className="h-4 w-24" />
                            ))}
                        </div>
                    </aside>
                    <main className="flex-1 p-8">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <Skeleton key={i} className="aspect-square" />
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
                {/* Sidebar */}
                <aside className="hidden lg:block w-48 flex-shrink-0 border-r border-border p-6 sticky top-14 h-[calc(100vh-3.5rem)]">
                    <h2 className="text-lg font-semibold mb-2">LIKE</h2>
                    <button
                        onClick={() => setVisibilitySheetOpen(true)}
                        className="text-xs text-muted-foreground hover:text-foreground mb-8 transition-colors"
                    >
                        {wishlist?.visibility === 'PUBLIC' ? '공개' : wishlist?.visibility === 'FRIENDS' ? '친구 공개' : '비공개'}
                    </button>

                    {/* Filter Menu */}
                    <nav className="space-y-3">
                        {SIDEBAR_MENU.map((item) => (
                            <button
                                key={item.filter}
                                onClick={() => setActiveFilter(item.filter)}
                                className={cn(
                                    'block text-sm transition-opacity hover:opacity-60 w-full text-left',
                                    activeFilter === item.filter ? 'font-medium' : 'text-muted-foreground'
                                )}
                            >
                                {item.label}
                                <span className="ml-2 text-xs text-muted-foreground">
                                    {countByStatus[item.filter as keyof typeof countByStatus]}
                                </span>
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="lg:hidden border-b border-border px-4 py-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-lg font-semibold">LIKE</h1>
                            <span className="text-sm text-muted-foreground">
                                {wishlist?.items.length || 0}개
                            </span>
                        </div>
                        {/* Mobile Filter */}
                        <div className="flex gap-4 mt-4 overflow-x-auto">
                            {SIDEBAR_MENU.map((item) => (
                                <button
                                    key={item.filter}
                                    onClick={() => setActiveFilter(item.filter)}
                                    className={cn(
                                        'text-sm whitespace-nowrap transition-opacity',
                                        activeFilter === item.filter ? 'font-medium' : 'text-muted-foreground'
                                    )}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="p-4 lg:p-8">
                        {filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Heart className="h-12 w-12 text-muted-foreground mb-4" strokeWidth={1} />
                                <p className="text-muted-foreground mb-6">
                                    {activeFilter ? '해당 상태의 아이템이 없습니다' : '위시리스트가 비어있습니다'}
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
                                        onStartFunding={() => handleStartFunding(item)}
                                        onViewFunding={() => item.fundingId && handleViewFunding(item.fundingId)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Modals */}
            <VisibilitySheet
                open={visibilitySheetOpen}
                onOpenChange={setVisibilitySheetOpen}
                currentVisibility={wishlist?.visibility || 'PUBLIC'}
                onVisibilityChange={handleVisibilityChange}
            />

            {selectedWishItem && (
                <CreateFundingModal
                    open={fundingModalOpen}
                    onOpenChange={setFundingModalOpen}
                    wishItem={{
                        id: selectedWishItem.id,
                        product: selectedWishItem.product,
                    }}
                    onSuccess={() => {
                        setFundingModalOpen(false);
                        toast.success('펀딩이 생성되었습니다');
                    }}
                />
            )}
        </AppShell>
    );
}

/**
 * 29cm Style Wish Item Card
 */
function WishItemCard29cm({
    item,
    onDelete,
    onStartFunding,
    onViewFunding,
}: {
    item: WishItem;
    onDelete: () => void;
    onStartFunding: () => void;
    onViewFunding: () => void;
}) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="group relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image */}
            <Link href={`/products/${item.product.id}`}>
                <div className="relative aspect-square bg-muted overflow-hidden">
                    {item.product.imageUrl ? (
                        <Image
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-muted-foreground text-xs">No Image</span>
                        </div>
                    )}
                </div>
            </Link>

            {/* Heart Icon - Always visible */}
            <button
                onClick={onDelete}
                className="absolute top-2 right-2 p-1 transition-opacity"
                aria-label="Remove from wishlist"
            >
                <Heart className="h-5 w-5 fill-foreground text-foreground" strokeWidth={1.5} />
            </button>

            {/* Product Info */}
            <div className="mt-3 space-y-1">
                <p className="text-xs text-muted-foreground">{item.product.brandName || 'Brand'}</p>
                <Link href={`/products/${item.product.id}`}>
                    <p className="text-sm line-clamp-2 hover:opacity-60 transition-opacity">
                        {item.product.name}
                    </p>
                </Link>
                <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium">{formatPrice(item.product.price)}</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-3 flex gap-2">
                {item.status === 'AVAILABLE' && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs h-8"
                        onClick={onStartFunding}
                    >
                        <Gift className="h-3 w-3 mr-1" strokeWidth={1.5} />
                        펀딩 시작
                    </Button>
                )}
                {item.status === 'IN_FUNDING' && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs h-8"
                        onClick={onViewFunding}
                    >
                        <ExternalLink className="h-3 w-3 mr-1" strokeWidth={1.5} />
                        펀딩 보기
                    </Button>
                )}
                {item.status === 'FUNDED' && (
                    <span className="text-xs text-muted-foreground">펀딩 완료</span>
                )}
            </div>
        </div>
    );
}
