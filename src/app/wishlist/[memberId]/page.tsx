'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AppShell } from '@/components/layout/AppShell';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, ExternalLink, Users, Gift, Globe, Lock, X, ShoppingCart } from 'lucide-react';
import { InlineError } from '@/components/common/InlineError';
import { useWishlist } from '@/features/wishlist/hooks/useWishlist';
import { WishItem, WishlistVisibility } from '@/types/wishlist';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/format';
import { toast } from 'sonner';
import { CreateFundingModal } from '@/features/funding/components/CreateFundingModal';
import { ParticipateModal } from '@/features/funding/components/ParticipateModal';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getFunding } from '@/lib/api/fundings';
import type { Funding } from '@/types/funding';

const PAGE_SIZE = 20;

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

const STATUS_FILTERS = [
    { label: '펀딩 대기 중', value: 'PENDING' },
    { label: '펀딩 진행 중', value: 'IN_PROGRESS' },
    { label: '펀딩 달성 완료', value: 'ACHIEVED' },
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

export default function PublicWishlistPage({ params }: { params: Promise<{ memberId: string }> }) {
    const { memberId } = use(params);
    const router = useRouter();
    const { user } = useAuth();
    const [currentPage, setCurrentPage] = useState(0);
    const [activeCategory, setActiveCategory] = useState('');
    const [activeStatus, setActiveStatus] = useState<string>('');
    const [selectedItem, setSelectedItem] = useState<WishItem | null>(null);
    const [selectedFunding, setSelectedFunding] = useState<Funding | null>(null);
    const [isStartFundingOpen, setIsStartFundingOpen] = useState(false);
    const [isParticipateOpen, setIsParticipateOpen] = useState(false);

    const { data: wishlist, isLoading: isWishlistLoading, error: wishlistError, refetch } = useWishlist(memberId, {
        page: 0,
        size: 100,
    });

    const handleViewFunding = (fundingId: string) => {
        router.push(`/fundings/${fundingId}`);
    };

    const handleStartFunding = (item: WishItem) => {
        if (!user) {
            router.push('/auth/login');
            return;
        }
        setSelectedItem(item);
        setIsStartFundingOpen(true);
    };

    const handleParticipateFunding = async (fundingId: string) => {
        console.log('handleParticipateFunding called with:', fundingId);
        if (!user) {
            console.log('User not logged in, redirecting');
            router.push('/auth/login');
            return;
        }

        const loadingToast = toast.loading('펀딩 정보를 불러오는 중...');
        try {
            console.log('Fetching funding details for id:', fundingId);
            const funding = await getFunding(fundingId);
            console.log('Successfully fetched funding:', funding);

            setSelectedFunding(funding);
            setIsParticipateOpen(true);
            toast.dismiss(loadingToast);
        } catch (error) {
            console.error('API Error during handleParticipateFunding:', error);
            toast.error('펀딩 정보를 불러오는데 실패했습니다.', { id: loadingToast });
        }
    };

    // Client-side filtering
    const allItems = wishlist?.items ?? [];
    const filteredItems = allItems.filter(item => {
        const matchesCategory = !activeCategory || item.product.category?.toLowerCase() === activeCategory.toLowerCase();

        if (!activeStatus) return matchesCategory;

        if (activeStatus === 'ACHIEVED') {
            return matchesCategory && (item.status === 'REQUESTED_CONFIRM' || item.status === 'COMPLETED');
        }

        return matchesCategory && item.status === activeStatus;
    }).sort((a, b) => {
        // 정렬 우선순위 정의
        const getPriority = (item: WishItem) => {
            // 4순위: 비활성 상품 (판매 중단)
            if (item.product.isActive === false) return 3;

            // 3순위: 품절 상품
            if (item.product.isSoldout) return 2;

            // 1순위: 펀딩 가능 (대기 중, 진행 중)
            if (item.status === 'PENDING' || item.status === 'IN_PROGRESS') return 0;

            // 2순위: 펀딩 달성 완료 (수락 대기, 완료)
            return 1;
        };

        return getPriority(a) - getPriority(b);
    });

    const totalItems = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    const paginatedItems = filteredItems.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        document.getElementById('wishlist-items-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    if (isWishlistLoading) {
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
                        </div>
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i}>
                                    <Skeleton className="aspect-[3/4]" />
                                    <Skeleton className="h-4 w-full mt-2" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <Footer />
            </AppShell>
        );
    }

    if (wishlistError) {
        return (
            <AppShell headerVariant="main">
                <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
                    <InlineError
                        message="위시리스트를 불러올 수 없습니다."
                        error={wishlistError}
                        onRetry={() => refetch()}
                    />
                </div>
            </AppShell>
        );
    }

    const nickname = wishlist?.member?.nickname || '친구';

    return (
        <AppShell headerVariant="main" headerTitle={`${nickname}님의 위시리스트`}>
            <div className="max-w-screen-xl mx-auto px-6 py-10">
                <section className="bg-card border border-border rounded-xl p-8 mb-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <Users className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    {nickname}님의 위시리스트
                                </h1>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                {wishlist?.visibility && (
                                    <VisibilityBadge visibility={wishlist.visibility} />
                                )}
                                <p className="text-sm text-muted-foreground">
                                    총 <strong className="text-foreground font-black">{totalItems.toLocaleString()}</strong>개의 상품
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex flex-col md:flex-row gap-10">
                    <aside className="w-full md:w-48 bg-card border border-border rounded-xl p-6 h-fit sticky top-24">
                        <h3 className="text-sm font-bold mb-4">카테고리</h3>
                        <ul className="space-y-1 mb-8">
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

                        <h3 className="text-sm font-bold mb-4">상태</h3>
                        <ul className="space-y-1">
                            {STATUS_FILTERS.map(filter => (
                                <li key={filter.value}>
                                    <button
                                        onClick={() => {
                                            setActiveStatus(prev => prev === filter.value ? '' : filter.value);
                                            setCurrentPage(0);
                                        }}
                                        className={cn(
                                            'w-full text-left px-3 py-2 rounded-md text-[13px] transition-colors font-medium',
                                            activeStatus === filter.value
                                                ? 'bg-foreground text-background'
                                                : 'text-muted-foreground hover:bg-muted'
                                        )}
                                    >
                                        {filter.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </aside>

                    <section id="wishlist-items-section" className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold flex items-center flex-wrap">
                                {activeCategory ? CATEGORIES.find(c => c.value === activeCategory)?.label : '전체 상품'}
                                <span className="ml-2 text-sm text-muted-foreground font-normal">
                                    {totalItems}개
                                </span>
                                {activeStatus && (
                                    <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-secondary text-secondary-foreground text-[11px] rounded transition-all">
                                        [{STATUS_FILTERS.find(f => f.value === activeStatus)?.label}]
                                        <button
                                            onClick={() => {
                                                setActiveStatus('');
                                                setCurrentPage(0);
                                            }}
                                            className="hover:text-foreground opacity-60 hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}
                            </h2>
                        </div>

                        {paginatedItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-xl bg-card/50">
                                <Heart className="h-12 w-12 text-muted-foreground/30 mb-4" strokeWidth={1} />
                                <p className="text-muted-foreground text-sm">해당 조건의 상품이 없습니다.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
                                {paginatedItems.map((item) => (
                                    <PublicWishItemCard
                                        key={item.id}
                                        item={item}
                                        onViewFunding={() => item.fundingId && handleViewFunding(item.fundingId)}
                                        onStartFunding={() => handleStartFunding(item)}
                                        onParticipate={() => {
                                            if (item.fundingId) {
                                                handleParticipateFunding(item.fundingId);
                                            } else {
                                                console.error('Missing fundingId for IN_PROGRESS item:', item);
                                                toast.error('참여할 수 있는 펀딩 정보를 찾을 수 없습니다.');
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-1 py-16">
                                <button
                                    disabled={currentPage === 0}
                                    onClick={() => handlePageChange(0)}
                                    className="px-3 py-1.5 text-[11px] font-medium border border-border rounded disabled:opacity-30"
                                >
                                    처음
                                </button>
                                {getPageNumbers(currentPage, totalPages).map((p, i) =>
                                    p === '...'
                                        ? <span key={i} className="px-2 text-[11px] text-muted-foreground">···</span>
                                        : <button
                                            key={p}
                                            onClick={() => handlePageChange(p as number)}
                                            className={cn(
                                                'px-3 py-1.5 text-[11px] font-medium border rounded transition-colors',
                                                p === currentPage ? 'bg-foreground text-background' : 'hover:border-foreground'
                                            )}
                                        >
                                            {(p as number) + 1}
                                        </button>
                                )}
                                <button
                                    disabled={currentPage >= totalPages - 1}
                                    onClick={() => handlePageChange(totalPages - 1)}
                                    className="px-3 py-1.5 text-[11px] font-medium border border-border rounded disabled:opacity-30"
                                >
                                    끝
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </div>
            {selectedItem && (
                <CreateFundingModal
                    open={isStartFundingOpen}
                    onOpenChange={setIsStartFundingOpen}
                    wishItem={selectedItem}
                    onSuccess={() => {
                        toast.success('장바구니에 담겼습니다.', {
                            description: '상품이 장바구니에 추가되었습니다.',
                            action: {
                                label: '장바구니 확인',
                                onClick: () => router.push('/cart')
                            }
                        });
                    }}
                />
            )}
            {selectedFunding && (
                <ParticipateModal
                    open={isParticipateOpen}
                    onOpenChange={setIsParticipateOpen}
                    funding={selectedFunding}
                    onSuccess={() => {
                        toast.success('장바구니에 담겼습니다.', {
                            description: '펀딩 참여가 장바구니에 추가되었습니다.',
                            action: {
                                label: '장바구니 확인',
                                onClick: () => router.push('/cart')
                            }
                        });
                    }}
                />
            )}
            <Footer />
        </AppShell>
    );
}

function PublicWishItemCard({
    item,
    onViewFunding,
    onStartFunding,
    onParticipate,
}: {
    item: WishItem;
    onViewFunding: () => void;
    onStartFunding: () => void;
    onParticipate: () => void;
}) {
    return (
        <div className="group relative">
            {/* 이미지 */}
            {item.product.isActive !== false ? (
                <Link href={`/products/${item.product.id}`}>
                    <div className="relative aspect-[3/4] bg-secondary overflow-hidden rounded-lg">
                        {item.product.imageUrl ? (
                            <Image
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                fill
                                className={cn(
                                    "object-cover transition-transform duration-300 group-hover:scale-105",
                                    item.product.isSoldout && "opacity-60 grayscale"
                                )}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-muted-foreground/40 text-xs">No Image</span>
                            </div>
                        )}

                        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                            {item.status === 'PENDING' && (
                                <div className="px-1.5 py-0.5 bg-black/60 text-white text-[10px] font-bold">펀딩 대기중</div>
                            )}
                            {item.status === 'IN_PROGRESS' && (
                                <div className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold">펀딩 진행 중</div>
                            )}
                            {item.status === 'REQUESTED_CONFIRM' && (
                                <div className="px-1.5 py-0.5 bg-black/60 text-white text-[10px] font-bold">펀딩 달성 완료</div>
                            )}
                            {item.status === 'COMPLETED' && (
                                <div className="px-1.5 py-0.5 bg-black/60 text-white text-[10px] font-bold">펀딩 달성 완료</div>
                            )}
                        </div>
                    </div>
                </Link>
            ) : (
                <div className="relative aspect-[3/4] bg-secondary overflow-hidden rounded-lg opacity-60">
                    {item.product.imageUrl ? (
                        <Image
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            fill
                            className="object-cover grayscale"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-muted-foreground/40 text-[10px] font-black uppercase">판매 중단</span>
                        </div>
                    )}
                </div>
            )}

            {/* 상품 정보 */}
            <div className="mt-3 space-y-0.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    {item.product.sellerNickname || item.product.brandName || 'Seller'}
                </p>
                {item.product.isActive !== false ? (
                    <Link href={`/products/${item.product.id}`}>
                        <p className="text-xs line-clamp-2 hover:underline transition-all leading-relaxed">
                            {item.product.name}
                        </p>
                    </Link>
                ) : (
                    <p className="text-xs line-clamp-2 leading-relaxed text-muted-foreground">
                        {item.product.name}
                    </p>
                )}
                <div className="flex items-center flex-wrap gap-2 mt-1">
                    <p className={cn(
                        "text-sm font-semibold pt-1",
                        (item.product.isSoldout || item.product.isActive === false) && "text-muted-foreground"
                    )}>
                        {formatPrice(item.product.price)}
                    </p>
                    {item.product.isActive === false ? (
                        <span className="text-[10px] font-bold text-white bg-red-600 px-1.5 py-0.5">
                            판매 중단
                        </span>
                    ) : item.product.isSoldout && (
                        <span className="text-[10px] font-bold text-white bg-black px-1.5 py-0.5">
                            품절
                        </span>
                    )}
                </div>
            </div>

            {item.status === 'PENDING' && item.product.isActive !== false && !item.product.isSoldout && (
                <div className="space-y-2 mt-2">
                    <button
                        onClick={onStartFunding}
                        className="w-full py-1.5 bg-black text-white rounded text-[10px] font-bold hover:bg-black/80 transition-colors flex items-center justify-center gap-1"
                    >
                        <ShoppingCart className="h-3 w-3" strokeWidth={2} />
                        장바구니 담기
                    </button>
                </div>
            )}

            {item.status === 'IN_PROGRESS' && (
                <div className="space-y-2 mt-2">
                    <button
                        onClick={onParticipate}
                        className="w-full py-1.5 bg-black text-white rounded text-[10px] font-bold hover:bg-black/80 transition-colors flex items-center justify-center gap-1"
                    >
                        <ShoppingCart className="h-3 w-3" strokeWidth={2} />
                        장바구니 담기
                    </button>
                    <button
                        onClick={onViewFunding}
                        className="w-full py-1.5 border border-border rounded text-[10px] font-medium hover:bg-secondary transition-colors flex items-center justify-center gap-1"
                    >
                        <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                        펀딩 보러가기
                    </button>
                </div>
            )}

            {(item.status === 'REQUESTED_CONFIRM' || item.status === 'COMPLETED') && (
                <div className="space-y-2 mt-2">
                    <button
                        onClick={onViewFunding}
                        className="w-full py-1.5 border border-border rounded text-[10px] font-medium hover:bg-secondary transition-colors flex items-center justify-center gap-1"
                    >
                        <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                        펀딩 보러가기
                    </button>
                </div>
            )}
        </div>
    );
}
