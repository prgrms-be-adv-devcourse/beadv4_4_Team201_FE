'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useCart } from '@/features/cart/hooks/useCart';
import { useUpdateCartItem, useRemoveCartItem, useToggleCartSelection } from '@/features/cart/hooks/useCartMutations';
import { Loader2, Minus, Plus, X, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function CartPage() {
    const router = useRouter();
    const { data: cart, isLoading } = useCart();
    const updateCartItem = useUpdateCartItem();
    const removeCartItem = useRemoveCartItem();
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
        removeCartItem.mutate(id, {
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
        if (!cart) return;
        selectedItems.forEach(item => {
            removeCartItem.mutate(item.id);
        });
    };

    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            toast.error('결제할 상품을 선택해주세요.');
            return;
        }
        router.push('/checkout');
    };

    if (isLoading) {
        return (
            <AppShell headerVariant="main">
                <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" strokeWidth={1.5} />
                </div>
            </AppShell>
        );
    }

    const hasItems = cart && cart.items.length > 0;

    return (
        <AppShell headerVariant="main">
            <div className="max-w-6xl mx-auto px-4 lg:px-8 py-12">
                {/* Page Title */}
                <h1 className="text-2xl font-semibold mb-12">장바구니</h1>

                {!hasItems ? (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-20">
                        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-6" strokeWidth={1} />
                        <p className="text-lg mb-2">장바구니가 비어있습니다</p>
                        <p className="text-muted-foreground mb-8">상품을 담아보세요</p>
                        <Link href="/products">
                            <Button variant="outline" size="lg">
                                쇼핑 계속하기
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Cart Table - Desktop */}
                        <div className="hidden md:block">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 border-b border-foreground pb-4 text-sm">
                                <div className="col-span-1">
                                    <Checkbox
                                        checked={allSelected}
                                        onCheckedChange={handleSelectAll}
                                        aria-label="전체 선택"
                                    />
                                </div>
                                <div className="col-span-5">상품 정보</div>
                                <div className="col-span-2 text-center">수량</div>
                                <div className="col-span-2 text-center">주문금액</div>
                                <div className="col-span-2 text-center">배송비</div>
                            </div>

                            {/* Cart Items */}
                            {cart.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="grid grid-cols-12 gap-4 border-b border-border py-6 items-center"
                                >
                                    {/* Checkbox */}
                                    <div className="col-span-1">
                                        <Checkbox
                                            checked={item.selected}
                                            onCheckedChange={(checked) =>
                                                handleToggleSelect(item.id, checked as boolean)
                                            }
                                        />
                                    </div>

                                    {/* Product Info */}
                                    <div className="col-span-5 flex gap-4">
                                        <div className="relative w-24 h-24 bg-muted flex-shrink-0">
                                            {item.product.imageUrl ? (
                                                <Image
                                                    src={item.product.imageUrl}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                                    No Image
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col justify-center min-w-0">
                                            <p className="text-xs text-muted-foreground mb-1">
                                                {item.product.brandName || 'Brand'}
                                            </p>
                                            <Link
                                                href={`/products/${item.product.id}`}
                                                className="text-sm hover:opacity-60 transition-opacity line-clamp-2"
                                            >
                                                {item.product.name}
                                            </Link>
                                            <p className="text-sm mt-2">
                                                {formatPrice(item.product.price)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quantity */}
                                    <div className="col-span-2 flex justify-center">
                                        <div className="flex items-center border border-border">
                                            <button
                                                onClick={() => handleUpdateAmount(item.id, Math.max(1, item.amount - 1))}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors"
                                                aria-label="수량 감소"
                                            >
                                                <Minus className="h-3 w-3" strokeWidth={1.5} />
                                            </button>
                                            <span className="w-10 text-center text-sm">{item.amount}</span>
                                            <button
                                                onClick={() => handleUpdateAmount(item.id, item.amount + 1)}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors"
                                                aria-label="수량 증가"
                                            >
                                                <Plus className="h-3 w-3" strokeWidth={1.5} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Order Amount */}
                                    <div className="col-span-2 text-center">
                                        <p className="text-sm font-medium">
                                            {formatPrice(item.product.price * item.amount)}
                                        </p>
                                    </div>

                                    {/* Shipping */}
                                    <div className="col-span-2 flex items-center justify-center gap-2">
                                        <span className="text-xs text-muted-foreground">무료 배송</span>
                                        <button
                                            onClick={() => handleRemove(item.id)}
                                            className="p-1 hover:opacity-60 transition-opacity ml-2"
                                            aria-label="삭제"
                                        >
                                            <X className="h-4 w-4" strokeWidth={1.5} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Actions */}
                            <div className="flex gap-3 py-6">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={handleSelectAll}
                                >
                                    전체상품 선택
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={handleRemoveSelected}
                                    disabled={selectedItems.length === 0}
                                >
                                    선택상품 삭제
                                </Button>
                            </div>
                        </div>

                        {/* Cart Items - Mobile */}
                        <div className="md:hidden space-y-4">
                            <div className="flex items-center gap-2 py-4 border-b border-foreground">
                                <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={handleSelectAll}
                                    aria-label="전체 선택"
                                />
                                <span className="text-sm font-medium">
                                    전체 선택 ({selectedItems.length}/{cart.items.length})
                                </span>
                            </div>

                            {cart.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex gap-4 py-4 border-b border-border"
                                >
                                    <Checkbox
                                        checked={item.selected}
                                        onCheckedChange={(checked) =>
                                            handleToggleSelect(item.id, checked as boolean)
                                        }
                                    />
                                    <div className="relative w-20 h-20 bg-muted flex-shrink-0">
                                        {item.product.imageUrl && (
                                            <Image
                                                src={item.product.imageUrl}
                                                alt={item.product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.product.brandName || 'Brand'}
                                                </p>
                                                <p className="text-sm line-clamp-2">{item.product.name}</p>
                                            </div>
                                            <button
                                                onClick={() => handleRemove(item.id)}
                                                className="p-1"
                                            >
                                                <X className="h-4 w-4" strokeWidth={1.5} />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center border border-border">
                                                <button
                                                    onClick={() =>
                                                        handleUpdateAmount(item.id, Math.max(1, item.amount - 1))
                                                    }
                                                    className="w-7 h-7 flex items-center justify-center"
                                                >
                                                    <Minus className="h-3 w-3" strokeWidth={1.5} />
                                                </button>
                                                <span className="w-8 text-center text-sm">{item.amount}</span>
                                                <button
                                                    onClick={() => handleUpdateAmount(item.id, item.amount + 1)}
                                                    className="w-7 h-7 flex items-center justify-center"
                                                >
                                                    <Plus className="h-3 w-3" strokeWidth={1.5} />
                                                </button>
                                            </div>
                                            <p className="font-medium">
                                                {formatPrice(item.product.price * item.amount)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="border-t border-foreground mt-12 pt-8">
                            <div className="grid md:grid-cols-3 gap-8 text-center mb-12">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">총 주문금액</p>
                                    <p className="text-2xl font-semibold">
                                        {totalAmount.toLocaleString()}<span className="text-base">원</span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">총 배송비</p>
                                    <p className="text-2xl font-semibold">
                                        0<span className="text-base">원</span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">총 결제금액</p>
                                    <p className="text-2xl font-semibold">
                                        {totalAmount.toLocaleString()}<span className="text-base">원</span>
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col md:flex-row gap-3 justify-center max-w-lg mx-auto">
                                <Link href="/products" className="flex-1">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="w-full h-14 text-base font-medium"
                                    >
                                        CONTINUE SHOPPING
                                    </Button>
                                </Link>
                                <Button
                                    size="lg"
                                    className="flex-1 h-14 text-base font-medium"
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
        </AppShell>
    );
}
