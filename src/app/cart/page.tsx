'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AppShell } from '@/components/layout/AppShell';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCart } from '@/features/cart/hooks/useCart';
import { useUpdateCartItem, useUpdateCartItems, useRemoveCartItems, useToggleCartSelection } from '@/features/cart/hooks/useCartMutations';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { InlineError } from '@/components/common/InlineError';
import { Gift, Loader2, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import { getMessageFromError } from '@/lib/error/error-messages';

export default function CartPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const { data: cart, isLoading: isCartLoading, isError, error, refetch } = useCart();
    const [editingItemIds, setEditingItemIds] = useState<Set<string>>(new Set());
    const [tempAmounts, setTempAmounts] = useState<Record<string, string>>({});

    // Redirect to login if not authenticated
    if (!isAuthLoading && !isAuthenticated) {
        window.location.href = '/auth/login';
        return null;
    }

    const isLoading = isAuthLoading || isCartLoading;
    const updateCartItem = useUpdateCartItem();
    const updateCartItems = useUpdateCartItems();
    const removeCartItems = useRemoveCartItems();
    const toggleSelection = useToggleCartSelection();

    const selectedItems = cart?.items.filter(item => item.selected) || [];
    const purchasableSelectedItems = selectedItems.filter(item => item.status === 'AVAILABLE');
    const totalAmount = purchasableSelectedItems.reduce((sum, item) => sum + item.amount, 0);
    const allSelected = (cart?.items.length ?? 0) > 0 && cart?.items.every(item => item.selected);

    const handleUpdateAmount = (id: string, amount: number) => {
        if (amount < 1000) {
            toast.error('최소 참여 금액은 1,000원입니다.');
            return;
        }

        updateCartItem.mutate(
            { itemId: id, data: { amount } },
            {
                onSuccess: () => {
                    setEditingItemIds((prev) => {
                        const next = new Set(prev);
                        next.delete(id);
                        return next;
                    });
                },
                onError: (error) => {
                    toast.error(getMessageFromError(error) || '금액 변경에 실패했습니다.');
                }
            }
        );
    };

    const toggleEdit = (id: string, currentAmount: number) => {
        setEditingItemIds((prev) => {
            const next = new Set(prev);
            const isEditing = next.has(id);

            if (isEditing) {
                // Save logic
                const tempValue = tempAmounts[id];
                const amount = parseInt(tempValue?.replace(/,/g, '') || '0', 10);

                if (amount < 1000) {
                    toast.error('최소 참여 금액은 1,000원입니다.');
                    return prev;
                }

                handleUpdateAmount(id, amount);
                return prev; // Let handleUpdateAmount success handler remove the ID
            } else {
                // Enter edit mode
                next.add(id);
                setTempAmounts(v => ({ ...v, [id]: currentAmount.toLocaleString() }));
            }
            return next;
        });
    };

    const handleCancelEdit = (id: string) => {
        setEditingItemIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
        setTempAmounts((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    const handleToggleSelect = (id: string, selected: boolean) => {
        toggleSelection.mutate(
            { itemId: id, selected },
            {
                onError: (error) => {
                    toast.error(getMessageFromError(error) || '금액 저장에 실패했습니다.');
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

    const handleBulkUpdate = () => {
        const updates: { itemId: string; amount: number }[] = [];
        const idsArray = Array.from(editingItemIds);

        for (const id of idsArray) {
            const tempValue = tempAmounts[id];
            const amount = parseInt(tempValue?.replace(/,/g, '') || '0', 10);

            if (amount < 1000) {
                toast.error('모든 참여 금액은 1,000원 이상이어야 합니다.');
                return;
            }
            updates.push({ itemId: id, amount });
        }

        if (updates.length === 0) return;

        updateCartItems.mutate(updates, {
            onSuccess: () => {
                toast.success('금액이 저장되었습니다.');
                setEditingItemIds(new Set());
            },
            onError: () => {
                toast.error('금액 저장에 실패했습니다.');
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
        if (purchasableSelectedItems.length === 0) {
            toast.error('결제 가능한 펀딩을 선택해주세요.');
            return;
        }
        router.push('/checkout');
    };


    if (isLoading) {
        return (
            <AppShell headerVariant="main" showBottomNav>
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
                    <Skeleton className="h-7 w-24 mb-8 md:mb-12" />
                    {/* Mobile skeleton */}
                    <div className="md:hidden space-y-0">
                        <div className="sticky top-[56px] z-30 bg-white flex items-center justify-between py-4 border-b border-foreground">
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
                    <div className="hidden md:block">
                        <div className="sticky top-[124px] z-30 bg-white grid grid-cols-8 gap-4 border-b border-foreground pb-3 pt-4">
                            <Skeleton className="col-span-1 h-4 w-4" />
                            <Skeleton className="col-span-5 h-4 w-20" />
                            <Skeleton className="col-span-2 h-4 w-16 mx-auto" />
                        </div>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="grid grid-cols-8 gap-4 border-b border-border py-6 items-start">
                                <Skeleton className="col-span-1 h-4 w-4 mt-1" />
                                <div className="col-span-5 flex gap-4">
                                    <Skeleton className="w-[100px] h-[130px] flex-shrink-0" />
                                    <div className="flex-1 space-y-2 py-1">
                                        <Skeleton className="h-3 w-24" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-20 mt-2" />
                                    </div>
                                </div>
                                <Skeleton className="col-span-2 h-6 w-20 mx-auto" />
                            </div>
                        ))}
                    </div>
                </div>
            </AppShell>
        );
    }

    if (isError) {
        return (
            <AppShell headerVariant="main" showBottomNav>
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
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
        <AppShell headerVariant="main" showBottomNav>
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
                {/* Page Title - 29cm Style */}
                <h1 className="text-xl lg:text-2xl font-medium tracking-tight mb-8 md:mb-12">장바구니</h1>

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
                        <div className="hidden md:block">
                            {/* Table Header */}
                            <div className="sticky top-[124px] z-30 bg-white grid grid-cols-8 gap-4 border-b border-foreground pb-3 pt-4 text-xs text-muted-foreground">
                                <div className="col-span-1 flex items-center">
                                    <Checkbox
                                        checked={allSelected}
                                        onCheckedChange={handleSelectAll}
                                        aria-label="전체 선택"
                                    />
                                </div>
                                <div className="col-span-5 flex items-center">펀딩 정보</div>
                                <div className="col-span-2 flex items-center justify-between">
                                    <span>참여 금액</span>
                                    <button
                                        onClick={handleRemoveSelected}
                                        disabled={selectedItems.length === 0}
                                        className="text-[11px] text-foreground border border-border rounded-sm px-2 py-1 hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        선택삭제
                                    </button>
                                </div>
                            </div>

                            {/* Cart Items */}
                            {cart.items.map((item) => {
                                const { funding, productName } = item;
                                const isAvailable = item.status === 'AVAILABLE';

                                return (
                                    <div
                                        key={item.id}
                                        className={cn(
                                            "grid grid-cols-8 gap-4 border-b border-border py-6 items-start",
                                            !isAvailable && "opacity-60"
                                        )}
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

                                        {/* Item Info - 29cm Style */}
                                        <div className="col-span-5 flex gap-4">
                                            <div className="relative w-[100px] h-[130px] bg-secondary flex-shrink-0 overflow-hidden">
                                                <Image
                                                    src={funding?.product?.imageUrl || "/images/placeholder-product.svg"}
                                                    alt={productName || "상품 이미지"}
                                                    fill
                                                    className={cn(
                                                        "object-cover transition-opacity",
                                                        isAvailable ? "hover:opacity-80" : "grayscale"
                                                    )}
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = "/images/placeholder-product.svg";
                                                    }}
                                                />
                                            </div>
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
                                                </div>
                                                <h3 className={cn(
                                                    "text-sm font-medium transition-all line-clamp-2 leading-relaxed",
                                                    isAvailable ? "hover:underline" : "text-muted-foreground"
                                                )}>
                                                    {productName || '상품 정보 없음'}
                                                </h3>

                                                {/* Unavailable message */}
                                                {!isAvailable && (
                                                    <div className="flex items-center gap-1.5 py-1 px-2 mt-2 bg-destructive/5 text-destructive border border-destructive/10 rounded text-[11px] font-medium animate-in fade-in slide-in-from-top-1 duration-300">
                                                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                                        <span>{item.statusMessage || '구매가 불가능한 상품입니다.'}</span>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-3 mt-2">
                                                    <p className="text-sm font-medium text-foreground">
                                                        {formatPrice(item.productPrice)}
                                                    </p>
                                                    {!item.isNewFunding && (
                                                        <>
                                                            <div className="h-3 w-[1px] bg-border" />
                                                            <p className="text-[11px] text-muted-foreground">
                                                                남은 금액: <span className="text-foreground font-medium">{formatPrice(Math.max(0, item.productPrice - (item.currentAmount || 0)))}</span>
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Participation Amount/Quantity - 29cm Style */}
                                        <div className="col-span-2 flex items-center justify-between pt-1">
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center w-28 shrink-0">
                                                    <input
                                                        type="text"
                                                        value={editingItemIds.has(item.id) ? (tempAmounts[item.id] || '') : item.amount.toLocaleString()}
                                                        onChange={(e) => {
                                                            if (!isAvailable) return;
                                                            const value = e.target.value.replace(/[^0-9]/g, '');
                                                            const formatted = value ? parseInt(value, 10).toLocaleString() : '';
                                                            setTempAmounts(v => ({ ...v, [item.id]: formatted }));
                                                        }}
                                                        disabled={!isAvailable || !editingItemIds.has(item.id)}
                                                        className={cn(
                                                            "text-sm font-medium text-left bg-transparent focus:outline-none py-1 transition-all",
                                                            !isAvailable ? "text-muted-foreground cursor-not-allowed" : "text-foreground",
                                                            editingItemIds.has(item.id) && "border-b border-foreground"
                                                        )}
                                                        style={{
                                                            width: `${Math.max(1, (editingItemIds.has(item.id) ? (tempAmounts[item.id] || '') : item.amount.toLocaleString()).length)}ch`,
                                                            minWidth: '2ch'
                                                        }}
                                                    />
                                                    <span className="text-sm text-foreground">
                                                        원
                                                    </span>
                                                </div>
                                                {isAvailable && (
                                                    <div className="flex flex-col gap-1 shrink-0">
                                                        <button
                                                            onClick={() => toggleEdit(item.id, item.amount)}
                                                            className="text-[11px] text-foreground border border-border rounded-sm px-2 py-0.5 hover:bg-secondary transition-colors shrink-0 whitespace-nowrap"
                                                        >
                                                            {editingItemIds.has(item.id) ? '저장' : '수정'}
                                                        </button>
                                                        {editingItemIds.has(item.id) && (
                                                            <button
                                                                onClick={() => handleCancelEdit(item.id)}
                                                                className="text-[11px] text-muted-foreground border border-border rounded-sm px-2 py-0.5 hover:bg-secondary transition-colors shrink-0 whitespace-nowrap"
                                                            >
                                                                취소
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleRemove(item.id)}
                                                className="text-black hover:opacity-70 transition-colors pr-0 p-1"
                                                aria-label="삭제"
                                            >
                                                <X className="h-8 w-4" stroke="black" />
                                            </button>
                                        </div>

                                    </div>
                                );
                            })}

                            {/* Action Buttons - 29cm Style */}
                            <div className="flex gap-2 py-6">
                                {editingItemIds.size > 0 && (
                                    <button
                                        onClick={handleBulkUpdate}
                                        className="px-4 py-2 bg-foreground text-background text-xs hover:opacity-90 transition-opacity"
                                    >
                                        변경사항 저장
                                    </button>
                                )}
                            </div>

                        </div>

                        {/* Mobile Cart - 29cm Style */}
                        <div className="md:hidden">
                            {/* Mobile Header */}
                            <div className="sticky top-[56px] z-30 bg-white flex items-center justify-between py-4 border-b border-foreground">
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
                                    className="text-xs text-foreground border border-border rounded-sm px-2 py-1 hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    선택 삭제
                                </button>
                            </div>

                            {/* Mobile Cart Items */}
                            {cart.items.map((item) => {
                                const { funding, productName } = item;
                                const isAvailable = item.status === 'AVAILABLE';

                                return (
                                    <div
                                        key={item.id}
                                        className={cn(
                                            "flex gap-3 py-5 border-b border-border",
                                            !isAvailable && "opacity-60"
                                        )}
                                    >
                                        <Checkbox
                                            checked={item.selected}
                                            onCheckedChange={(checked) =>
                                                handleToggleSelect(item.id, checked as boolean)
                                            }
                                            className="mt-1"
                                        />
                                        <div className="relative w-20 h-24 bg-secondary flex-shrink-0 overflow-hidden">
                                            <Image
                                                src={funding?.product?.imageUrl || "/images/placeholder-product.svg"}
                                                alt={productName || "상품"}
                                                fill
                                                className={cn("object-cover", !isAvailable && "grayscale")}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = "/images/placeholder-product.svg";
                                                }}
                                            />
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
                                                    <p className={cn(
                                                        "text-sm line-clamp-2",
                                                        !isAvailable && "text-muted-foreground"
                                                    )}>{productName || '상품 정보 없음'}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs font-medium text-foreground">{formatPrice(item.productPrice)}</span>
                                                        {!item.isNewFunding && (
                                                            <span className="text-[10px] text-muted-foreground">
                                                                (남은 금액: {formatPrice(Math.max(0, item.productPrice - (item.currentAmount || 0)))})
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemove(item.id)}
                                                    className="text-xs text-muted-foreground ml-2 shrink-0"
                                                >
                                                    삭제
                                                </button>
                                            </div>

                                            {/* Unavailable message */}
                                            {!isAvailable && (
                                                <div className="flex items-center gap-1.5 py-1 px-2 mb-2 bg-destructive/5 text-destructive border border-destructive/10 rounded text-[10px] font-medium animate-in fade-in slide-in-from-top-1 duration-300">
                                                    <AlertCircle className="h-3 w-3 shrink-0" />
                                                    <span>{item.statusMessage || '구매 불가'}</span>
                                                </div>
                                            )}

                                            {/* Amount Input */}
                                            <div className="flex items-center justify-end gap-1 mt-4">
                                                <span className="text-xs text-foreground shrink-0">참여 금액</span>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="flex items-center justify-end">
                                                        <input
                                                            type="text"
                                                            value={editingItemIds.has(item.id) ? (tempAmounts[item.id] || '') : item.amount.toLocaleString()}
                                                            onChange={(e) => {
                                                                if (!isAvailable) return;
                                                                const value = e.target.value.replace(/[^0-9]/g, '');
                                                                const formatted = value ? parseInt(value, 10).toLocaleString() : '';
                                                                setTempAmounts(v => ({ ...v, [item.id]: formatted }));
                                                            }}
                                                            disabled={!isAvailable || !editingItemIds.has(item.id)}
                                                            className={cn(
                                                                "text-sm font-medium text-right bg-transparent focus:outline-none py-0.5 transition-all outline-none",
                                                                !isAvailable ? "text-muted-foreground cursor-not-allowed" : "text-foreground",
                                                                editingItemIds.has(item.id) && "border-b border-foreground"
                                                            )}
                                                            style={{
                                                                width: `${Math.max(2, (editingItemIds.has(item.id) ? (tempAmounts[item.id] || '') : item.amount.toLocaleString()).length)}ch`,
                                                            }}
                                                        />
                                                        <span className="text-sm">원</span>
                                                    </div>
                                                    {isAvailable && (
                                                        <div className="flex gap-1 shrink-0">
                                                            <button
                                                                onClick={() => toggleEdit(item.id, item.amount)}
                                                                className="text-[11px] text-foreground border border-border rounded-sm px-2 py-0.5 hover:bg-secondary transition-colors shrink-0 ml-1 whitespace-nowrap"
                                                            >
                                                                {editingItemIds.has(item.id) ? '저장' : '수정'}
                                                            </button>
                                                            {editingItemIds.has(item.id) && (
                                                                <button
                                                                    onClick={() => handleCancelEdit(item.id)}
                                                                    className="text-[11px] text-muted-foreground border border-border rounded-sm px-2 py-0.5 hover:bg-secondary transition-colors shrink-0 whitespace-nowrap"
                                                                >
                                                                    취소
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
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
                            <div className="grid grid-cols-3 gap-4 text-center mb-8 md:mb-12">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-2">총 참여 금액</p>
                                    <p className="text-xl lg:text-2xl font-medium tracking-tight">
                                        {totalAmount.toLocaleString()}<span className="text-sm lg:text-base font-normal">원</span>
                                    </p>
                                </div>
                                <div className="relative">
                                    {/* Plus/Equal symbols */}
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 text-muted-foreground hidden md:block">+</div>
                                    <p className="text-xs text-muted-foreground mb-2">수수료</p>
                                    <p className="text-xl lg:text-2xl font-medium tracking-tight">
                                        0<span className="text-sm lg:text-base font-normal">원</span>
                                    </p>
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-muted-foreground hidden md:block">=</div>
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
                                    disabled={purchasableSelectedItems.length === 0}
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
