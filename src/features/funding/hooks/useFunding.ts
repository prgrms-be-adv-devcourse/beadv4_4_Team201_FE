import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import {
  getFunding,
  getMyFunding,
  getParticipatedFunding,
  getMyParticipatedFundings,
  getMyReceivedFundings,
} from '@/lib/api/fundings';
import type { FundingQueryParams } from '@/types/funding';

import { useAuth } from '@/features/auth/hooks/useAuth';

/**
 * Hook to fetch a specific funding detail
 * @param fundingId - The ID of the funding to fetch
 */
export function useFunding(fundingId: string) {
  return useQuery({
    queryKey: queryKeys.funding(fundingId),
    queryFn: () => getFunding(fundingId),
    enabled: !!fundingId,
  });
}

/**
 * Hook to fetch a specific my funding detail
 * @param fundingId - The ID of the funding to fetch
 */
export function useMyFunding(fundingId: string) {
  return useQuery({
    queryKey: queryKeys.myFunding(fundingId),
    queryFn: () => getMyFunding(fundingId),
    enabled: !!fundingId,
  });
}

/**
 * Hook to fetch a specific participated funding detail
 * @param fundingId - The ID of the participated funding to fetch
 */
export function useParticipatedFunding(fundingId: string) {
  return useQuery({
    queryKey: ['participatedFunding', fundingId],
    queryFn: () => getParticipatedFunding(fundingId),
    enabled: !!fundingId,
  });
}


/**
 * Hook to fetch fundings the current user has participated in
 * @param params - Query parameters (status, page, size)
 */
export function useMyParticipatedFundings(params?: FundingQueryParams) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...queryKeys.myParticipatedFundings, params],
    queryFn: async () => {
      if (params?.status === 'ACCEPTED') {
        const [acceptedRes, expiredRes] = await Promise.all([
          getMyParticipatedFundings({ ...params, status: 'ACCEPTED' }),
          getMyParticipatedFundings({ ...params, status: 'EXPIRED' }),
        ]);

        const combinedItems = [...acceptedRes.items, ...expiredRes.items];

        return {
          content: combinedItems,
          items: combinedItems,
          page: {
            ...acceptedRes.page,
            totalElements: acceptedRes.page.totalElements + expiredRes.page.totalElements,
          },
        };
      }
      return getMyParticipatedFundings(params);
    },
    enabled: !!user,
  });
}

/**
 * Hook to fetch fundings the current user has received
 * @param params - Query parameters (status, page, size)
 */
export function useMyReceivedFundings(params?: FundingQueryParams) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...queryKeys.myReceivedFundings, params],
    queryFn: async () => {
      if (params?.status === 'ACCEPTED') {
        const [acceptedRes, expiredRes] = await Promise.all([
          getMyReceivedFundings({ ...params, status: 'ACCEPTED' }),
          getMyReceivedFundings({ ...params, status: 'EXPIRED' }),
        ]);

        // Merge items and sort them (e.g., by createdAt or id, but here we just concat)
        const combinedItems = [...acceptedRes.items, ...expiredRes.items];

        // Creating a combined response (Pagination metadata might be inaccurate if there are many pages)
        return {
          content: combinedItems,
          items: combinedItems,
          page: {
            ...acceptedRes.page,
            totalElements: acceptedRes.page.totalElements + expiredRes.page.totalElements,
          },
        };
      }
      return getMyReceivedFundings(params);
    },
    enabled: !!user,
  });
}
