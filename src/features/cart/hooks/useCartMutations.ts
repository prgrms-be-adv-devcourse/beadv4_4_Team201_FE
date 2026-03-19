import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import {
  addCartItem,
  updateCartItem,
  updateCartItems,
  removeCartItem,
  toggleCartItemSelection,
  parseCartItemId,
} from '@/lib/api/cart';
import type { Cart, CartItemCreateRequest, CartItemUpdateRequest } from '@/types/cart';

/**
 * Hook to add an item to the cart
 *
 * @note 백엔드 V2 API는 POST /api/v2/carts 형식으로
 *       인증 토큰의 memberId로 장바구니를 식별합니다.
 *
 * Invalidates: cart, funding(id)
 */
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CartItemCreateRequest) => {
      const message = await addCartItem(data);
      return message;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      // Also invalidate the specific funding unconditionally
      queryClient.invalidateQueries({ queryKey: queryKeys.funding(variables.wishlistItemId as string) });
    },
  });
}

/**
 * Hook to update a cart item (amount)
 *
 * Invalidates: cart
 *
 * Includes optimistic update for better UX
 */
export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: CartItemUpdateRequest }) =>
      updateCartItem(itemId, data),
    onMutate: async ({ itemId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.cart });

      // Snapshot the previous value
      const previousCart = queryClient.getQueryData(queryKeys.cart);

      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.cart, (old: Cart | undefined) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item) =>
            item.id === itemId ? { ...item, ...data } : item
          ),
        };
      });

      // Return a context with the previous value
      return { previousCart };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousCart) {
        queryClient.setQueryData(queryKeys.cart, context.previousCart);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}

/**
 * Hook to remove an item from the cart
 *
 * Invalidates: cart
 *
 * Includes optimistic update for better UX
 */
/**
 * Hook to remove items from the cart (supports batch deletion)
 *
 * Invalidates: cart
 *
 * Includes optimistic update for better UX
 */
export function useRemoveCartItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemIds: string[]) => {
      const idsToRemove = itemIds.map((id) => parseCartItemId(id).targetId);
      await removeCartItem(idsToRemove);
    },
    onMutate: async (itemIds) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.cart });

      // Snapshot the previous value
      const previousCart = queryClient.getQueryData(queryKeys.cart);

      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.cart, (old: Cart | undefined) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.filter((item) => !itemIds.includes(item.id)),
        };
      });

      // Return a context with the previous value
      return { previousCart };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousCart) {
        queryClient.setQueryData(queryKeys.cart, context.previousCart);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}

/**
 * Hook to toggle cart item selection (checkbox)
 *
 * @note 선택 상태는 백엔드에 저장되지 않으므로 로컬 캐시에서만 관리합니다.
 *       서버 refetch 시 선택 상태가 리셋되지 않도록 invalidateQueries를 호출하지 않습니다.
 */
export function useToggleCartSelection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, selected }: { itemId: string; selected: boolean }) =>
      toggleCartItemSelection(itemId, selected),
    onMutate: async ({ itemId, selected }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart });

      const previousCart = queryClient.getQueryData(queryKeys.cart);

      queryClient.setQueryData(queryKeys.cart, (old: Cart | undefined) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item) =>
            item.id === itemId ? { ...item, selected } : item
          ),
        };
      });

      return { previousCart };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(queryKeys.cart, context.previousCart);
      }
    },
    // onSettled 제거: 서버 refetch하면 selected 상태가 리셋됨
  });
}

/**
 * Hook to update multiple cart items (amounts)
 *
 * Invalidates: cart
 *
 * Includes optimistic update for better UX
 */
export function useUpdateCartItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: { itemId: string; amount: number; wishlistId: string | number | null }[]) =>
      updateCartItems(updates),
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart });
      const previousCart = queryClient.getQueryData(queryKeys.cart);

      queryClient.setQueryData(queryKeys.cart, (old: Cart | undefined) => {
        if (!old) return old;
        const updateMap = new Map(updates.map((u) => [u.itemId, u.amount]));
        return {
          ...old,
          items: old.items.map((item) =>
            updateMap.has(item.id) ? { ...item, amount: updateMap.get(item.id)! } : item
          ),
        };
      });

      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(queryKeys.cart, context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}
