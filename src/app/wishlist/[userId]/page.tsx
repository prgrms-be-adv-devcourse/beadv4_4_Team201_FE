'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Footer } from '@/components/layout/Footer';
import { AccessDeniedView } from '@/features/wishlist/components/AccessDeniedView';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { usePublicWishlist } from '@/features/wishlist/hooks/useWishlist';
import { CreateFundingModal } from '@/features/funding/components/CreateFundingModal';
import { InlineError } from '@/components/common/InlineError';
import { Gift } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';

import type { PublicWishlistItem } from '@/types/wishlist';

// Categories for sidebar filter (same as products page for consistency)
const CATEGORIES = [
  { label: '전체', value: '' },
  { label: '전자기기', value: 'ELECTRONICS' },
  { label: '뷰티', value: 'BEAUTY' },
  { label: '패션/액세서리', value: 'FASHION' },
  { label: '리빙/생활', value: 'LIVING' },
  { label: '식품/음료', value: 'FOODS' },
  { label: '완구/취미', value: 'TOYS' },
  { label: '아웃도어', value: 'OUTDOOR' },
  { label: '반려동물', value: 'PET' },
  { label: '주방', value: 'KITCHEN' },
];

interface FriendWishlistPageProps {
    params: Promise<{
        userId: string;
    }>;
}

export default function FriendWishlistPage({ params }: FriendWishlistPageProps) {
    const { userId } = use(params);
    const router = useRouter();
    const { data: wishlist, isLoading, error, refetch } = usePublicWishlist(userId);
    const [selectedItem, setSelectedItem] = useState<PublicWishlistItem | null>(null);
    const [isStartFundingOpen, setIsStartFundingOpen] = useState(false);

    const handleStartFundingClick = (item: PublicWishlistItem) => {
        setSelectedItem(item);
        setIsStartFundingOpen(true);
    };

    if (isLoading) {
        return (
            <AppShell headerVariant="main" showBottomNav={false}>
                <div className="max-w-screen-2xl mx-auto px-8">
                    <div className="flex min-h-screen gap-12 pt-8">
                        <aside className="hidden lg:block w-40 flex-shrink-0 pt-4">
                            <Skeleton className="h-64 w-full mb-8" />
                            <Skeleton className="h-64 w-full" />
                        </aside>
                        <main className="flex-1 min-w-0 pb-20">
                            <div className="flex items-center gap-6 mb-16">
                                <Skeleton className="w-24 h-24 rounded-full" />
                                <div className="space-y-3">
                                    <Skeleton className="h-8 w-64" />
                                    <Skeleton className="h-4 w-40" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 gap-y-12">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="space-y-4">
                                        <Skeleton className="aspect-square w-full rounded-none" />
                                        <div className="space-y-2">
                                          <Skeleton className="h-3 w-full" />
                                          <Skeleton className="h-4 w-2/3" />
                                          <Skeleton className="h-8 w-full mt-2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </main>
                    </div>
                </div>
            </AppShell>
        );
    }

    if (error || !wishlist) {
        return (
            <AppShell headerVariant="main" showBottomNav={false}>
                <div className="max-w-screen-2xl mx-auto px-8 py-24">
                    {error ? (
                        <InlineError
                            message="위시리스트를 불러올 수 없습니다."
                            error={error}
                            onRetry={() => refetch()}
                            fullPage
                        />
                    ) : (
                        <AccessDeniedView />
                    )}
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell headerVariant="main" showBottomNav={false}>
            <div className="max-w-screen-2xl mx-auto px-8">
                <div className="flex min-h-screen gap-12 pt-8">
                    {/* Sidebar - Desktop */}
                    <aside className="hidden lg:block w-40 flex-shrink-0 pt-4 sticky top-40 h-[calc(100vh-10rem)] overflow-y-auto no-scrollbar">
                        <div className="mb-12">
                            <h3 className="text-[10px] font-black text-black mb-6 uppercase tracking-widest">
                                Category
                            </h3>
                            <ul className="space-y-3">
                                {CATEGORIES.map((cat) => (
                                    <li key={cat.value}>
                                        <button
                                            onClick={() => router.push(`/products?category=${cat.value}`)}
                                            className="text-xs transition-opacity hover:opacity-60 text-left w-full text-gray-400 font-medium"
                                        >
                                            {cat.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mb-12">
                            <h3 className="text-[10px] font-black text-black mb-6 uppercase tracking-widest">
                                Price
                            </h3>
                            <ul className="space-y-3">
                                {[
                                    { label: '전체', min: '', max: '' },
                                    { label: '~5만원', min: '', max: '50000' },
                                    { label: '5~10만원', min: '50000', max: '100000' },
                                    { label: '10만원~', min: '100000', max: '' },
                                ].map((range) => (
                                    <li key={range.label}>
                                        <button
                                            onClick={() => router.push(`/products?minPrice=${range.min}&maxPrice=${range.max}`)}
                                            className="text-xs transition-opacity hover:opacity-60 text-left w-full text-gray-400 font-medium"
                                        >
                                            {range.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0 pb-20">
                        {/* User Header Section (Editorial Style) */}
                        <div className="flex flex-col md:flex-row items-center gap-10 mb-20 pb-16 border-b border-gray-100">
                             <div className="w-28 h-28 rounded-full bg-[#f3f3f3] flex items-center justify-center text-black text-3xl font-black shadow-inner">
                                {wishlist.nickname.charAt(0)}
                            </div>
                            <div className="text-center md:text-left">
                                <h1 className="text-4xl font-black tracking-tighter mb-3">
                                    {wishlist.nickname}님의 위시리스트
                                </h1>
                                <div className="flex items-center justify-center md:justify-start gap-4">
                                    <p className="text-[11px] text-gray-500 uppercase tracking-[0.2em] font-bold">
                                        {wishlist.items.length} ITEMS COLLECTED
                                    </p>
                                    <div className="h-3 w-px bg-gray-200" />
                                    <p className="text-[11px] text-gray-500 uppercase tracking-[0.2em] font-bold">
                                        PUBLIC WISHLIST
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Items Section Header */}
                        <div className="flex items-end justify-between mb-10">
                            <div>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1.5">For Joy</p>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-black tracking-tight uppercase">Wish Items</h2>
                                    <span className="text-[10px] font-black bg-black text-white px-2 py-0.5">
                                        {wishlist.items.length}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {wishlist.items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-40 text-center border-t border-gray-100 animate-in fade-in duration-700">
                                <div className="w-16 h-16 bg-gray-50 flex items-center justify-center mb-8">
                                    <Gift className="w-8 h-8 text-gray-200" strokeWidth={1} />
                                </div>
                                <p className="text-xs font-black tracking-widest uppercase mb-1">Zero Wishes</p>
                                <p className="text-[11px] text-gray-400">친구가 아직 선물을 담지 않았습니다.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 gap-y-12">
                                {wishlist.items.map((item) => (
                                    <PublicItemCard
                                        key={item.wishlistItemId}
                                        item={item}
                                        onStartFunding={() => handleStartFundingClick(item)}
                                    />
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {selectedItem && (
                <CreateFundingModal
                    open={isStartFundingOpen}
                    onOpenChange={setIsStartFundingOpen}
                    wishItem={{
                        id: selectedItem.wishlistItemId,
                        product: {
                            name: selectedItem.productName,
                            price: selectedItem.price,
                            imageUrl: '',
                        },
                    }}
                    onSuccess={() => router.push('/cart')}
                />
            )}
            <Footer />
        </AppShell>
    );
}

function PublicItemCard({ item, onStartFunding }: { item: PublicWishlistItem; onStartFunding: () => void }) {
    return (
        <div className="group flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Image Box */}
            <div className="relative aspect-square w-full overflow-hidden bg-[#f9f9f9] mb-4 group-hover:bg-[#f3f3f3] transition-colors">
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20">
                     <Gift className="w-12 h-12 text-gray-400 mb-2" strokeWidth={1} />
                     <span className="text-[10px] font-bold tracking-widest uppercase">No Image</span>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
            </div>

            {/* Info Box */}
            <div className="px-1 space-y-1.5 flex-1">
                <h3 className="text-xs font-medium text-gray-900 line-clamp-2 leading-tight group-hover:opacity-60 transition-opacity min-h-[2.5rem]">
                    {item.productName}
                </h3>
                <p className="text-sm font-black tracking-tighter tabular-nums mt-1">
                    {formatPrice(item.price)}
                </p>
                <div className="pt-2 flex items-center justify-between">
                     <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                        Added {new Date(item.addedAt).toLocaleDateString('ko-KR').replace(/\. /g, '.').replace('.', '')}
                     </span>
                </div>
            </div>

            {/* Action Button - 29cm Style */}
            <Button
                className="mt-5 w-full h-10 px-0 rounded-none bg-black text-white text-[10px] font-bold tracking-[0.2em] hover:bg-gray-800 transition-colors uppercase border-none"
                onClick={onStartFunding}
            >
                Start Funding
            </Button>
        </div>
    );
}
