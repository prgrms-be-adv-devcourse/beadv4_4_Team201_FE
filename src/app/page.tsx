import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query/get-query-client';
import { HomePageClient } from '@/features/home/components/HomePageClient';

export default async function HomePage() {
  const queryClient = getQueryClient();


  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomePageClient />
    </HydrationBoundary>
  );
}
