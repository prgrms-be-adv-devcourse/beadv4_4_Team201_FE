import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query/get-query-client';
import { queryKeys } from '@/lib/query/keys';
import { getPopularProducts, getProducts } from '@/lib/api/products';
import { HomePageClient } from '@/features/home/components/HomePageClient';

export const revalidate = 300;

export default async function HomePage() {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.popular(),
      queryFn: () => getPopularProducts(4),
    }),
    queryClient.prefetchQuery({
      queryKey: ['products', 'recommended'],
      queryFn: () => getProducts({ size: 4 }),
    }),
    queryClient.prefetchQuery({
      queryKey: ['products', 'hot'],
      queryFn: () => getProducts({ size: 4, sort: 'price_desc' }),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomePageClient />
    </HydrationBoundary>
  );
}
