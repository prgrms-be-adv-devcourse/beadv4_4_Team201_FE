import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { useAddWishlistItem, useRemoveWishlistItem } from './useWishlistMutations';
import { useUser } from '@auth0/nextjs-auth0/client';
import { toast } from 'sonner';

import type { Wishlist, WishItem } from '@/types/wishlist';

/**
 * Hook to manage wishlist state for a specific product
 */
export function useWishlistItem(productId: string) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const addMutation = useAddWishlistItem();
  const removeMutation = useRemoveWishlistItem();

  // Read wishlist from cache without triggering a fetch
  const wishlist = queryClient.getQueryData<Wishlist>(queryKeys.myWishlist);

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
    } catch {
      toast.error('처리 중 오류가 발생했습니다');
    }
  }, [user, isInWishlist, wishlistItem?.id, productId, addMutation, removeMutation]);

  return {
    isInWishlist,
    toggleWishlist,
    isLoading: addMutation.isPending || removeMutation.isPending,
  };
}
