import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import {
  acceptFunding,
  refuseFunding,
  type RefuseFundingRequest,
} from '@/lib/api/fundings';
import { addCartItem } from '@/lib/api/cart';

/**
 * Hook to create a new funding (add FUNDING_PENDING to cart)
 *
 * @note 펀딩 생성은 장바구니에 FUNDING_PENDING 타입으로 추가한 후
 *       checkout 플로우(주문+결제)에서 실제로 생성됩니다.
 *
 * Invalidates: cart
 */
export function useCreateFunding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      wishItemId,
      amount,
    }: {
      wishItemId: string;
      amount: number;
      expiresInDays?: number;
      message?: string;
    }) => {
      // 장바구니에 FUNDING_PENDING 타입으로 추가
      await addCartItem({
        targetType: 'FUNDING_PENDING',
        targetId: wishItemId,
        amount,
      });

      return { wishItemId, amount };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      queryClient.invalidateQueries({ queryKey: queryKeys.myWishlist });
    },
  });
}

/**
 * Hook to participate in a funding (add FUNDING to cart)
 *
 * @note 펀딩 참여는 장바구니에 FUNDING 타입으로 추가한 후
 *       checkout 플로우(주문+결제)에서 실제로 기여됩니다.
 *
 * Invalidates: cart
 */
export function useParticipateFunding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ wishItemId, amount }: { wishItemId: string; amount: number }) => {
      // 장바구니에 FUNDING 타입으로 추가
      await addCartItem({
        targetType: 'FUNDING',
        targetId: wishItemId,
        amount,
      });

      return { wishItemId, amount };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}

/**
 * Hook to accept a completed funding (recipient action)
 *
 * Invalidates: funding(id), myReceivedFundings
 */
export function useAcceptFunding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fundingId: string) => acceptFunding(fundingId),
    onSuccess: (_, fundingId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.funding(fundingId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.myFunding(fundingId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.myReceivedFundings });
    },
  });
}

/**
 * Hook to refuse a completed funding (recipient action)
 *
 * Invalidates: funding(id), myReceivedFundings
 */
export function useRefuseFunding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fundingId, data }: { fundingId: string; data?: RefuseFundingRequest }) =>
      refuseFunding(fundingId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.funding(variables.fundingId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.myFunding(variables.fundingId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.myReceivedFundings });
    },
  });
}
