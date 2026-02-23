'use client';

import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export function HomePageSkeleton() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Welcome Section Skeleton */}
      <section className="border-b border-border">
        <div className="max-w-screen-2xl mx-auto px-8 py-12">
          <Skeleton className="h-24 w-full rounded-none" />
        </div>
      </section>

      <Separator className="h-2 bg-secondary/30" />

      {/* My Fundings Section Skeleton */}
      <section className="py-8">
        <div className="max-w-screen-2xl mx-auto px-8 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-[220px] shrink-0 space-y-4">
                <Skeleton className="aspect-[4/5] w-full rounded-none" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator className="h-2 bg-secondary/30" />

      {/* Friends' Wishlists Section Skeleton */}
      <section className="py-8">
        <div className="max-w-screen-2xl mx-auto px-8 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-16" />
          </div>

          <div className="space-y-0 divide-y divide-border">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-none" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-4" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator className="h-2 bg-secondary/30" />

      {/* Popular Products Section Skeleton */}
      <section className="py-8 pb-12">
        <div className="max-w-screen-2xl mx-auto px-8 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 border-t border-l border-border">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border-r border-b border-border">
                <Skeleton className="aspect-[4/5] w-full rounded-none" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
