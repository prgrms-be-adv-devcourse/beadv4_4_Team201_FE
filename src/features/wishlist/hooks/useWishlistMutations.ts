import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import {
  addWishlistItem,
  removeWishlistItem,
  updateWishlistVisibility,
  type UpdateWishlistSettingsRequest,
} from '@/lib/api/wishlists';
import type { WishItemCreateRequest, Wishlist } from '@/types/wishlist';

/**
 * Hook to add an item to the user's wishlist
 *
 * Invalidates: myWishlist
 */
export function useAddWishlistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WishItemCreateRequest) => addWishlistItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlists'] });
    },
  });
}

/**
 * Hook to remove an item from the user's wishlist
 *
 * Invalidates: myWishlist
 */
export function useRemoveWishlistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => removeWishlistItem(itemId),
    onMutate: async (itemId) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: queryKeys.myWishlist });

      // Snapshot the previous value
      const previousWishlist = queryClient.getQueryData(queryKeys.myWishlist);

      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.myWishlist, (old: Wishlist | undefined) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.filter((item) => item.id !== itemId),
          itemCount: Math.max(0, old.itemCount - 1),
        };
      });

      // Return a context object with the snapshotted value
      return { previousWishlist };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, itemId, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(queryKeys.myWishlist, context.previousWishlist);
      }
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlists'] });
    },
  });
}

/**
 * Hook to update wishlist visibility (PUBLIC/FRIENDS/PRIVATE)
 *
 * Invalidates: myWishlist
 */
export function useUpdateVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateWishlistSettingsRequest) => updateWishlistVisibility(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlists'] });
    },
  });
}
