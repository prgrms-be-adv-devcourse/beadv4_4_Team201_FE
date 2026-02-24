import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { useAddWishlistItem, useRemoveWishlistItem } from './useWishlistMutations';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { checkWishlistItemExistence } from '@/lib/api/wishlists';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api/client';

import type { WishItem } from '@/types/wishlist';

import { useMyWishlist } from './useWishlist';

/**
 * Hook to manage wishlist state for a specific product
 */
export function useWishlistItem(productId: string) {
  const { user } = useAuth();
  const { data: wishlist } = useMyWishlist({ page: 0, size: 100 });

  const { data: isInWishlistServer = false } = useQuery({
    queryKey: ['wishlists', 'check', productId],
    queryFn: () => checkWishlistItemExistence(productId),
    enabled: !!user && !!productId,
  });

  const addMutation = useAddWishlistItem();
  const removeMutation = useRemoveWishlistItem();

  // Find the actual item in the cached wishlist to get its ID for deletion
  const wishlistItem = wishlist?.items?.find((item: WishItem) => {
    const itemProdId = (item.product?.id || item.productId || '').toString().replace('product-', '');
    const targetId = productId.toString().replace('product-', '');
    return itemProdId === targetId;
  });

  // Use server check as primary source, fallback to local find for safety
  const isInWishlist = isInWishlistServer || !!wishlistItem;

  const toggleWishlist = useCallback(async () => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }

    try {
      if (isInWishlist && wishlistItem?.id) {
        await removeMutation.mutateAsync(wishlistItem.id);
        toast.success('위시리스트에서 삭제했습니다');
      } else {
        await addMutation.mutateAsync({ productId });
        toast.success('위시리스트에 추가했습니다');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'W204') {
          toast.error('진행 중인 펀딩이 있어 삭제가 불가합니다.');
        } else if (error.code === 'W201') {
          toast.error('이미 위시리스트에 존재하는 상품입니다.');
        } else {
          toast.error('처리 중 오류가 발생했습니다');
        }
      } else {
        toast.error('처리 중 오류가 발생했습니다');
      }
    }
  }, [user, isInWishlist, wishlistItem?.id, productId, addMutation, removeMutation]);

  return {
    isInWishlist,
    toggleWishlist,
    isLoading: addMutation.isPending || removeMutation.isPending,
  };
}
