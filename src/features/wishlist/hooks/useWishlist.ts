import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getMyWishlist, getWishlist, searchPublicWishlists, getPublicWishlist } from '@/lib/api/wishlists';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { WishlistQueryParams } from '@/types/wishlist';

/**
 * Hook to fetch the current user's wishlist
 */
export function useMyWishlist(params: WishlistQueryParams = { page: 0, size: 20 }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...queryKeys.myWishlist, params],
    queryFn: () => getMyWishlist(params),
    enabled: !!user,
  });
}

/**
 * Hook to fetch a specific member's wishlist
 * @param memberId - The ID of the member whose wishlist to fetch
 */
export function useWishlist(memberId: string, params: WishlistQueryParams = { page: 0, size: 20 }) {
  return useQuery({
    queryKey: [...queryKeys.wishlist(memberId), params],
    queryFn: () => getWishlist(memberId, params),
    enabled: !!memberId,
  });
}

export function usePublicWishlistSearch(nickname?: string) {
  return useQuery({
    queryKey: queryKeys.publicWishlistSearch(nickname),
    queryFn: () => searchPublicWishlists(nickname),
  });
}

export function usePublicWishlist(memberId: string) {
  return useQuery({
    queryKey: queryKeys.publicWishlist(memberId),
    queryFn: () => getPublicWishlist(memberId),
    enabled: !!memberId,
  });
}
