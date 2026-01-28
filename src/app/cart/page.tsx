'use client';

import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CartItem } from '@/features/cart/components/CartItem';
import { CartSummary } from '@/features/cart/components/CartSummary';
import { CartEmptyState } from '@/features/cart/components/CartEmptyState';
import { useCart } from '@/features/cart/hooks/useCart';
import { useUpdateCartItem, useRemoveCartItem, useToggleCartSelection } from '@/features/cart/hooks/useCartMutations';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CartPage() {
    const router = useRouter();
    const { data: cart, isLoading } = useCart();
    const updateCartItem = useUpdateCartItem();
    const removeCartItem = useRemoveCartItem();
    const toggleSelection = useToggleCartSelection();

    const selectedItems = cart?.items.filter(item => item.selected) || [];
    const totalAmount = selectedItems.reduce((sum, item) => sum + item.amount, 0);
    const allSelected = (cart?.items.length ?? 0) > 0 && cart?.items.every(item => item.selected);
    const someSelected = cart?.items.some(item => item.selected);

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

    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            toast.error('결제할 상품을 선택해주세요.');
            return;
        }
        router.push('/checkout');
    };

    if (isLoading) {
        return (
            <AppShell
                headerTitle="장바구니"
                headerVariant="detail"
                hasBack={true}
                showBottomNav={true}
            >
                <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </AppShell>
        );
    }

    const hasItems = cart && cart.items.length > 0;

    return (
        <AppShell
            headerTitle="장바구니"
            headerVariant="detail"
            hasBack={true}
            showBottomNav={true}
        >
            <div className="flex flex-col min-h-[calc(100vh-3.5rem)] pb-24">
                {!hasItems ? (
                    <CartEmptyState />
                ) : (
                    <>
                        <div className="flex items-center gap-2 p-4 border-b">
                            <Checkbox
                                checked={allSelected}
                                onCheckedChange={handleSelectAll}
                                aria-label="전체 선택"
                            />
                            <span className="text-sm font-medium">
                                전체 선택 ({selectedItems.length}/{cart.items.length})
                            </span>
                        </div>

                        <div className="flex flex-col gap-3 p-4">
                            {cart.items.map((item) => (
                                <CartItem
                                    key={item.id}
                                    item={item}
                                    onUpdateAmount={handleUpdateAmount}
                                    onToggleSelect={handleToggleSelect}
                                    onRemove={handleRemove}
                                />
                            ))}
                        </div>

                        <CartSummary
                            totalItems={selectedItems.length}
                            totalAmount={totalAmount}
                            onCheckout={handleCheckout}
                        />
                    </>
                )}
            </div>
        </AppShell>
    );
}
