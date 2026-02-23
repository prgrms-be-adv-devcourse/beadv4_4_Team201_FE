import { useQueries } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getPopularProducts, getProducts } from '@/lib/api/products';
import { getMyParticipatedFundings } from '@/lib/api/fundings';
import type { HomeData } from '@/types/home';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function useHomeData() {
  const { isAuthenticated } = useAuth();

  const results = useQueries({
    queries: [
      {
        queryKey: queryKeys.products.popular(),
        queryFn: () => getPopularProducts(4),
      },
      {
        queryKey: queryKeys.myParticipatedFundings,
        queryFn: () => getMyParticipatedFundings({ size: 5 }),
        enabled: isAuthenticated,
      },
      {
        queryKey: ['products', 'recommended'],
        queryFn: () => getProducts({ size: 4 }),
      },
      {
        queryKey: ['products', 'hot'],
        queryFn: () => getProducts({ size: 4, sort: 'price_desc' }),
      },
    ],
  });

  const [
      popularProductsQuery,
      myFundingsQuery,
      recommendedProductsQuery,
      hotProductsQuery
  ] = results;

  const isLoading = popularProductsQuery.isLoading ||
      recommendedProductsQuery.isLoading || hotProductsQuery.isLoading;

  const isError = popularProductsQuery.isError;
  const error = popularProductsQuery.error;

  const refetch = () => results.forEach(q => q.refetch());

  const popularProducts = popularProductsQuery.data?.items ?? [];
  const myFundings = myFundingsQuery.data?.items ?? [];
  const recommendedProducts = recommendedProductsQuery.data?.items ?? [];
  const hotProducts = hotProductsQuery.data?.items ?? [];

  const data: HomeData | undefined = !isLoading ? {
    member: null,
    myFundings: myFundings,
    popularProducts: popularProducts,
    recommendedProducts: recommendedProducts,
    hotProducts: hotProducts,
  } : undefined;

  return {
    data,
    isLoading,
    isError,
    error,
    refetch
  };
}
