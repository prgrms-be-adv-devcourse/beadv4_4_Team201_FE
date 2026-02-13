import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { placeOrder } from '@/lib/api/orders';
import type { PlaceOrderRequest, PlaceOrderResult } from '@/types/order';

/**
 * Hook to place an order with payment (V2 unified API)
 *
 * @note V2 API는 주문 생성과 결제를 한 번에 처리합니다.
 *       별도의 Payment API 호출이 필요하지 않습니다.
 *
 * Invalidates: orders, cart, myParticipatedFundings
 */
export function usePlaceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: PlaceOrderRequest): Promise<PlaceOrderResult> => {
      const idempotencyKey = crypto.randomUUID();
      return placeOrder(request, idempotencyKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      queryClient.invalidateQueries({ queryKey: queryKeys.myParticipatedFundings });
    },
  });
}
