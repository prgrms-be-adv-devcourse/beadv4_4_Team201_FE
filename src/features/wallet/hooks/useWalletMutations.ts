import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { chargeWallet, withdrawWallet } from '@/lib/api/wallet';
import type { WalletChargeRequest, WalletWithdrawRequest } from '@/types/wallet';

/**
 * Hook to charge the wallet (add balance)
 *
 * Invalidates: wallet, walletHistory
 */
export function useChargeWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WalletChargeRequest) => chargeWallet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet });
      queryClient.invalidateQueries({ queryKey: queryKeys.walletHistory() });
    },
  });
}

/**
 * Hook to withdraw from the wallet (transfer to bank account)
 *
 * Invalidates: wallet, walletHistory
 */
export function useWithdrawWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WalletWithdrawRequest) => withdrawWallet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet });
      queryClient.invalidateQueries({ queryKey: queryKeys.walletHistory() });
    },
  });
}
