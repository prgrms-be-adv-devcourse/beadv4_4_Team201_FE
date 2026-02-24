import { useCallback } from 'react';
import { useAddWishlistItem, useRemoveWishlistItem } from './useWishlistMutations';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useMyWishlist } from './useWishlist';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api/client';

import type { WishItem } from '@/types/wishlist';

/**
 * Hook to manage wishlist state for a specific product
 */
export function useWishlistItem(productId: string) {
  const { user } = useAuth();
  const { data: wishlist } = useMyWishlist({ page: 0, size: 100 }); // Large size to check existence
  const addMutation = useAddWishlistItem();
  const removeMutation = useRemoveWishlistItem();

  // Check if product is in wishlist
  const wishlistItem = wishlist?.items?.find(
    (item: WishItem) => item.product?.id === productId || item.productId === productId
  );
  const isInWishlist = !!wishlistItem;

  const toggleWishlist = useCallback(async () => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }

    try {
      if (isInWishlist && wishlistItem?.id) {
        await removeMutation.mutateAsync(wishlistItem.id);
        toast.success('찜 목록에서 삭제했습니다');
      } else {
        await addMutation.mutateAsync({ productId });
        toast.success('찜 목록에 추가했습니다');
      }
    } catch (error) {
      if (error instanceof ApiError && error.code === 'W204') {
        toast.error('진행 중인 펀딩이 있어 삭제가 불가합니다.');
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
