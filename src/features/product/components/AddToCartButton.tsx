'use client';

import { ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAddToCart } from '@/features/cart/hooks/useCartMutations';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';
import { getMessageFromError } from '@/lib/error/error-messages';

interface AddToCartButtonProps {
    productId: string;
    className?: string;
    variant?: 'default' | 'outline' | 'ghost' | 'secondary';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    showText?: boolean;
}

/**
 * AddToCartButton - Component to add a product to the cart
 */
export function AddToCartButton({
    productId,
    className,
    variant = 'outline',
    size = 'lg',
    showText = true,
}: AddToCartButtonProps) {
    const addToCartMutation = useAddToCart();

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (addToCartMutation.isPending) return;

        try {
            await addToCartMutation.mutateAsync({
                wishItemId: productId,
                amount: 10000,
            });

            toast.success('장바구니에 담겼습니다.');
        } catch (error: any) {
            toast.error(getMessageFromError(error) || '장바구니 담기에 실패했습니다.');
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            className={cn('gap-2', className)}
            onClick={handleAddToCart}
            disabled={addToCartMutation.isPending}
        >
            {addToCartMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
                <ShoppingCart className="h-5 w-5" />
            )}
            {showText && (addToCartMutation.isPending ? '담는 중...' : '장바구니')}
        </Button>
    );
}
