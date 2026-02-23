'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AppShell } from '@/components/layout/AppShell';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCart } from '@/features/cart/hooks/useCart';
import { useUpdateCartItem, useRemoveCartItems, useToggleCartSelection } from '@/features/cart/hooks/useCartMutations';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { InlineError } from '@/components/common/InlineError';
import { Gift, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/format';

export default function CartPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const { data: cart, isLoading: isCartLoading, isError, error, refetch } = useCart();

    // Redirect to login if not authenticated
    if (!isAuthLoading && !isAuthenticated) {
        window.location.href = '/auth/login';
        return null;
    }

    const isLoading = isAuthLoading || isCartLoading;
    const updateCartItem = useUpdateCartItem();
    const removeCartItems = useRemoveCartItems();
    const toggleSelection = useToggleCartSelection();

    const selectedItems = cart?.items.filter(item => item.selected) || [];
    const totalAmount = selectedItems.reduce((sum, item) => sum + item.amount, 0);
    const allSelected = (cart?.items.length ?? 0) > 0 && cart?.items.every(item => item.selected);

    const handleUpdateAmount = (id: string, amount: number) => {
        updateCartItem.mutate(
            { itemId: id, data: { amount } },
            {
                onError: () => {
                    toast.error('금액 변경에 실패했습니다.');
                }
            }
        );
    };

    const handleToggleSelect = (id: string, selected: boolean) => {
        toggleSelection.mutate(
            { itemId: id, selected },
            {
                onError: () => {
                    toast.error('선택 변경에 실패했습니다.');
                }
            }
        );
    };

    const handleRemove = (id: string) => {
        removeCartItems.mutate([id], {
            onSuccess: () => {
                toast.success('장바구니에서 삭제되었습니다.');
            },
            onError: () => {
                toast.error('삭제에 실패했습니다.');
            }
        });
    };

    const handleSelectAll = () => {
        if (!cart) return;
        const newSelected = !allSelected;
        cart.items.forEach(item => {
            if (item.selected !== newSelected) {
                toggleSelection.mutate({ itemId: item.id, selected: newSelected });
            }
        });
    };

    const handleRemoveSelected = () => {
        if (!cart || selectedItems.length === 0) return;
        
        const selectedIds = selectedItems.map(item => item.id);
        
        removeCartItems.mutate(selectedIds, {
            onSuccess: () => {
                toast.success(`${selectedIds.length}개의 상품이 삭제되었습니다.`);
            },
            onError: () => {
                toast.error('선택 상품 삭제에 실패했습니다.');
            }
        });
    };

    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            toast.error('결제할 펀딩을 선택해주세요.');
            return;
        }
        router.push('/checkout');
    };

    // Calculate D-day helper
    const getDaysLeft = (expiresAt: string) => {
        const today = new Date();
        const expiryDate = new Date(expiresAt);
        return Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    if (isLoading) {
        return (
            <AppShell headerVariant="main">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
                    <Skeleton className="h-7 w-24 mb-8 lg:mb-12" />
                    {/* Mobile skeleton */}
                    <div className="lg:hidden space-y-0">
                        <div className="flex items-center justify-between py-4 border-b border-foreground">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-3 py-5 border-b border-border">
                                <Skeleton className="w-5 h-5 mt-1" />
                                <Skeleton className="w-20 h-24 flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-1 w-full mt-2" />
                                    <div className="flex justify-between">
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-3 w-12" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Desktop skeleton */}
                    <div className="hidden lg:block">
                        <div className="grid grid-cols-12 gap-4 border-b border-foreground pb-3">
                            <Skeleton className="col-span-1 h-4 w-4" />
                            <Skeleton className="col-span-5 h-4 w-20" />
                            <Skeleton className="col-span-2 h-4 w-16 mx-auto" />
                            <Skeleton className="col-span-2 h-4 w-12 mx-auto" />
                            <Skeleton className="col-span-2 h-4 w-12 mx-auto" />
                        </div>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="grid grid-cols-12 gap-4 border-b border-border py-6 items-start">
                                <Skeleton className="col-span-1 h-4 w-4 mt-1" />
                                <div className="col-span-5 flex gap-4">
                                    <Skeleton className="w-[100px] h-[130px] flex-shrink-0" />
                                    <div className="flex-1 space-y-2 py-1">
                                        <Skeleton className="h-3 w-24" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-20 mt-2" />
                                        <Skeleton className="h-3 w-28" />
                                    </div>
                                </div>
                                <Skeleton className="col-span-2 h-6 w-20 mx-auto" />
                                <Skeleton className="col-span-2 h-4 w-full" />
                                <Skeleton className="col-span-2 h-5 w-12 mx-auto" />
                            </div>
                        ))}
                    </div>
                </div>
            </AppShell>
        );
    }

    if (isError) {
        return (
            <AppShell headerVariant="main">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
                    <h1 className="text-xl lg:text-2xl font-medium tracking-tight mb-8">장바구니</h1>
                    <InlineError
                        message="장바구니를 불러오는데 실패했습니다."
                        error={error}
                        onRetry={() => refetch()}
                    />
                </div>
            </AppShell>
        );
    }

    const hasItems = cart && cart.items.length > 0;

    return (
        <AppShell headerVariant="main">
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
                {/* Page Title - 29cm Style */}
                <h1 className="text-xl lg:text-2xl font-medium tracking-tight mb-8 lg:mb-12">장바구니</h1>

                {!hasItems ? (
                    /* Empty State - 29cm Minimal Style */
                    <div className="flex flex-col items-center justify-center py-24 lg:py-32">
                        <Gift className="h-16 w-16 text-muted-foreground/50 mb-6" strokeWidth={1} />
                        <p className="text-lg font-medium mb-2">장바구니가 비어있습니다</p>
                        <p className="text-sm text-muted-foreground mb-8">친구들의 펀딩에 참여해보세요</p>
                        <Link href="/fundings">
                            <Button variant="outline" className="h-12 px-8 text-sm font-normal">
                                펀딩 둘러보기
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Cart Table - Desktop (29cm Style) */}
                        <div className="hidden lg:block">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 border-b border-foreground pb-3 text-xs text-muted-foreground">
                                <div className="col-span-1 flex items-center">
                                    <Checkbox
                                        checked={allSelected}
                                        onCheckedChange={handleSelectAll}
                                        aria-label="전체 선택"
                                    />
                                </div>
                                <div className="col-span-5">펀딩 정보</div>
                                <div className="col-span-2 text-center">참여 금액</div>
                                <div className="col-span-2 text-center">진행률</div>
                                <div className="col-span-2 text-center">마감</div>
                            </div>

                            {/* Cart Items */}
                            {cart.items.map((item) => {
                                const { funding } = item;
                                const progressPercent = (funding.currentAmount / funding.targetAmount) * 100;
                                const daysLeft = getDaysLeft(funding.expiresAt);

                                return (
                                    <div
                                        key={item.id}
                                        className="grid grid-cols-12 gap-4 border-b border-border py-6 items-start"
                                    >
                                        {/* Checkbox */}
                                        <div className="col-span-1 pt-1">
                                            <Checkbox
                                                checked={item.selected}
                                                onCheckedChange={(checked) =>
                                                    handleToggleSelect(item.id, checked as boolean)
                                                }
                                            />
                                        </div>

                                        {/* Funding Info - 29cm Style */}
                                        <div className="col-span-5 flex gap-4">
                                            <Link
                                                href={`/fundings/${funding.id}`}
                                                className="relative w-[100px] h-[130px] bg-secondary flex-shrink-0 overflow-hidden"
                                            >
                                                {funding.product.imageUrl ? (
                                                    <Image
                                                        src={funding.product.imageUrl}
                                                        alt={funding.product.name}
                                                        fill
                                                        className="object-cover hover:opacity-80 transition-opacity"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/50 text-xs">
                                                        No Image
                                                    </div>
                                                )}
                                            </Link>
                                            <div className="flex flex-col justify-start min-w-0 py-1">
                                                {/* Recipient Info */}
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Avatar className="h-5 w-5">
                                                        <AvatarImage src={funding.recipient.avatarUrl || ''} />
                                                        <AvatarFallback className="text-[10px]">
                                                            {(funding.recipient.nickname || '알')[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-xs text-muted-foreground">
                                                        {funding.recipient.nickname || '알 수 없음'}님에게
                                                    </span>
                                                    {item.isNewFunding && (
                                                        <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5">NEW</span>
                                                    )}
                                                </div>
                                                <Link
                                                    href={`/fundings/${funding.id}`}
                                                    className="text-sm hover:underline transition-all line-clamp-2 leading-relaxed"
                                                >
                                                    {funding.product.name}
                                                </Link>
                                                <p className="text-sm font-medium mt-2">
                                                    {formatPrice(funding.targetAmount)}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    현재 {formatPrice(funding.currentAmount)} 모금됨
                                                </p>
                                            </div>
                                        </div>

                                        {/* Participation Amount - 29cm Style */}
                                        <div className="col-span-2 flex flex-col items-center gap-2 pt-1">
                                            <div className="w-full max-w-[120px]">
                                                <input
                                                    type="text"
                                                    value={item.amount.toLocaleString()}
                                                    onChange={(e) => {
                                                        const value = parseInt(e.target.value.replace(/,/g, '')) || 0;
                                                        if (value >= 0) {
                                                            handleUpdateAmount(item.id, value);
                                                        }
                                                    }}
                                                    className="w-full text-sm font-medium text-center bg-transparent border-b border-border focus:border-foreground focus:outline-none py-1"
                                                />
                                                <p className="text-[11px] text-muted-foreground text-center mt-1">원</p>
                                            </div>
                                            <button
                                                onClick={() => handleRemove(item.id)}
                                                className="text-[11px] text-muted-foreground hover:text-foreground underline transition-colors"
                                            >
                                                삭제
                                            </button>
                                        </div>

                                        {/* Progress */}
                                        <div className="col-span-2 pt-1">
                                            <div className="space-y-1">
                                                <Progress value={progressPercent} className="h-1.5" />
                                                <p className="text-xs text-muted-foreground text-center">
                                                    {Math.round(progressPercent)}% 달성
                                                </p>
                                            </div>
                                        </div>

                                        {/* Days Left - 29cm Style */}
                                        <div className="col-span-2 text-center pt-1">
                                            <p className={`text-sm font-medium ${daysLeft <= 3 ? 'text-destructive' : ''}`}>
                                                D-{daysLeft}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground mt-1">
                                                {funding.participantCount}명 참여
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Action Buttons - 29cm Style */}
                            <div className="flex gap-2 py-6">
                                <button
                                    onClick={handleSelectAll}
                                    className="px-4 py-2 border border-border text-xs hover:bg-secondary transition-colors"
                                >
                                    전체상품 선택
                                </button>
                                <button
                                    onClick={handleRemoveSelected}
                                    disabled={selectedItems.length === 0}
                                    className="px-4 py-2 border border-border text-xs hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    선택상품 삭제
                                </button>
                            </div>

                            {/* Cart Notice - 29cm Style */}
                            <div className="text-right text-xs text-muted-foreground py-2">
                                장바구니는 최대 100개의 펀딩을 담을 수 있습니다.
                            </div>
                        </div>

                        {/* Mobile Cart - 29cm Style */}
                        <div className="lg:hidden">
                            {/* Mobile Header */}
                            <div className="flex items-center justify-between py-4 border-b border-foreground">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        checked={allSelected}
                                        onCheckedChange={handleSelectAll}
                                        aria-label="전체 선택"
                                    />
                                    <span className="text-sm">
                                        전체 선택 ({selectedItems.length}/{cart.items.length})
                                    </span>
                                </div>
                                <button
                                    onClick={handleRemoveSelected}
                                    disabled={selectedItems.length === 0}
                                    className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
                                >
                                    선택 삭제
                                </button>
                            </div>

                            {/* Mobile Cart Items */}
                            {cart.items.map((item) => {
                                const { funding } = item;
                                const progressPercent = (funding.currentAmount / funding.targetAmount) * 100;
                                const daysLeft = getDaysLeft(funding.expiresAt);

                                return (
                                    <div
                                        key={item.id}
                                        className="flex gap-3 py-5 border-b border-border"
                                    >
                                        <Checkbox
                                            checked={item.selected}
                                            onCheckedChange={(checked) =>
                                                handleToggleSelect(item.id, checked as boolean)
                                            }
                                            className="mt-1"
                                        />
                                        <div className="relative w-20 h-24 bg-secondary flex-shrink-0 overflow-hidden">
                                            {funding.product.imageUrl && (
                                                <Image
                                                    src={funding.product.imageUrl}
                                                    alt={funding.product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="min-w-0">
                                                    {/* Recipient */}
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <Avatar className="h-4 w-4">
                                                            <AvatarImage src={funding.recipient.avatarUrl || ''} />
                                                            <AvatarFallback className="text-[9px]">
                                                                {(funding.recipient.nickname || '알')[0]}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {funding.recipient.nickname}님에게
                                                        </span>
                                                    </div>
                                                    <p className="text-sm line-clamp-2">{funding.product.name}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemove(item.id)}
                                                    className="text-xs text-muted-foreground ml-2 shrink-0"
                                                >
                                                    삭제
                                                </button>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="space-y-1 mt-2">
                                                <Progress value={progressPercent} className="h-1" />
                                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                                    <span>{Math.round(progressPercent)}% 달성</span>
                                                    <span className={daysLeft <= 3 ? 'text-destructive' : ''}>
                                                        D-{daysLeft}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Amount Input */}
                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-xs text-muted-foreground">참여 금액</span>
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="text"
                                                        value={item.amount.toLocaleString()}
                                                        onChange={(e) => {
                                                            const value = parseInt(e.target.value.replace(/,/g, '')) || 0;
                                                            if (value >= 0) {
                                                                handleUpdateAmount(item.id, value);
                                                            }
                                                        }}
                                                        className="w-20 text-sm font-medium text-right bg-transparent border-b border-border focus:border-foreground focus:outline-none py-0.5"
                                                    />
                                                    <span className="text-sm">원</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Order Summary - 29cm Style */}
                        <div className="border-t border-foreground mt-8 lg:mt-12 pt-8 lg:pt-10">
                            {/* Summary Grid */}
                            <div className="grid grid-cols-3 gap-4 text-center mb-8 lg:mb-12">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-2">총 참여 금액</p>
                                    <p className="text-xl lg:text-2xl font-medium tracking-tight">
                                        {totalAmount.toLocaleString()}<span className="text-sm lg:text-base font-normal">원</span>
                                    </p>
                                </div>
                                <div className="relative">
                                    {/* Plus/Equal symbols */}
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 text-muted-foreground hidden lg:block">+</div>
                                    <p className="text-xs text-muted-foreground mb-2">수수료</p>
                                    <p className="text-xl lg:text-2xl font-medium tracking-tight">
                                        0<span className="text-sm lg:text-base font-normal">원</span>
                                    </p>
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-muted-foreground hidden lg:block">=</div>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-2">총 결제 금액</p>
                                    <p className="text-xl lg:text-2xl font-medium tracking-tight">
                                        {totalAmount.toLocaleString()}<span className="text-sm lg:text-base font-normal">원</span>
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons - 29cm Style */}
                            <div className="flex flex-col md:flex-row gap-3 justify-center max-w-xl mx-auto">
                                <Link href="/fundings" className="flex-1">
                                    <Button
                                        variant="outline"
                                        className="w-full h-14 text-sm font-normal tracking-wide"
                                    >
                                        CONTINUE SHOPPING
                                    </Button>
                                </Link>
                                <Button
                                    className="flex-1 h-14 text-sm font-normal tracking-wide"
                                    onClick={handleCheckout}
                                    disabled={selectedItems.length === 0}
                                >
                                    CHECK OUT
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Footer */}
            <Footer />
        </AppShell>
    );
}
