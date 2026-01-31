'use client';

import { Suspense } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { ProductList } from '@/features/product/components/ProductList';
import { useInfiniteProducts, useInfiniteSearchProducts } from '@/features/product/hooks/useProducts';
import { Loader2, X } from 'lucide-react';
import type { ProductQueryParams } from '@/types/product';
import { cn } from '@/lib/utils';

// Categories for sidebar filter
const CATEGORIES = [
  { label: '전체', value: '' },
  { label: '가방', value: 'BAG' },
  { label: '지갑', value: 'WALLET' },
  { label: '악세서리', value: 'ACCESSORY' },
  { label: '의류', value: 'CLOTHING' },
  { label: '신발', value: 'SHOES' },
  { label: '뷰티', value: 'BEAUTY' },
  { label: '테크', value: 'TECH' },
  { label: '홈/리빙', value: 'HOME' },
  { label: '푸드', value: 'FOOD' },
];

// Sort options
const SORT_OPTIONS = [
  { label: '인기순', value: 'popular' },
  { label: '신상품순', value: 'newest' },
  { label: '낮은가격순', value: 'price_asc' },
  { label: '높은가격순', value: 'price_desc' },
];

function ProductSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const sort = (searchParams.get('sort') as ProductQueryParams['sort']) || 'popular';

  const searchEnabled = !!searchQuery;

  const searchResult = useInfiniteSearchProducts({
    q: searchQuery,
    category: category || undefined,
    size: 20,
  });

  const productsResult = useInfiniteProducts({
    category: category || undefined,
    minPrice,
    maxPrice,
    sort,
    size: 20,
  });

  const result = searchEnabled ? searchResult : productsResult;
  const products = result.data?.pages.flatMap((page) => page.items) || [];
  const isLoading = result.isLoading;
  const hasNextPage = result.hasNextPage;
  const isFetchingNextPage = result.isFetchingNextPage;
  const totalElements = result.data?.pages[0]?.page?.totalElements || 0;

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          result.fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, result]);

  // Update URL params
  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/products?${params.toString()}`);
  };

  const clearSearch = () => {
    router.push('/products');
  };

  return (
    <AppShell headerVariant="main">
      <div className="flex min-h-screen">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-48 flex-shrink-0 border-r border-border p-6 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
          {/* Search Query Display */}
          {searchQuery && (
            <div className="mb-8">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">"{searchQuery}"</span>
                <button
                  onClick={clearSearch}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          )}

          {/* Categories */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
              카테고리
            </h3>
            <ul className="space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat.value}>
                  <button
                    onClick={() => updateParams('category', cat.value)}
                    className={cn(
                      'text-sm transition-opacity hover:opacity-60',
                      category === cat.value ? 'font-medium' : 'text-muted-foreground'
                    )}
                  >
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Price Range */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
              가격
            </h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    updateParams('minPrice', '');
                    updateParams('maxPrice', '');
                  }}
                  className={cn(
                    'text-sm transition-opacity hover:opacity-60',
                    !minPrice && !maxPrice ? 'font-medium' : 'text-muted-foreground'
                  )}
                >
                  전체
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    updateParams('maxPrice', '50000');
                    updateParams('minPrice', '');
                  }}
                  className={cn(
                    'text-sm transition-opacity hover:opacity-60',
                    maxPrice === 50000 ? 'font-medium' : 'text-muted-foreground'
                  )}
                >
                  ~5만원
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    updateParams('minPrice', '50000');
                    updateParams('maxPrice', '100000');
                  }}
                  className={cn(
                    'text-sm transition-opacity hover:opacity-60',
                    minPrice === 50000 && maxPrice === 100000 ? 'font-medium' : 'text-muted-foreground'
                  )}
                >
                  5~10만원
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    updateParams('minPrice', '100000');
                    updateParams('maxPrice', '');
                  }}
                  className={cn(
                    'text-sm transition-opacity hover:opacity-60',
                    minPrice === 100000 && !maxPrice ? 'font-medium' : 'text-muted-foreground'
                  )}
                >
                  10만원~
                </button>
              </li>
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Header */}
          <div className="sticky top-14 bg-background z-10 border-b border-border px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {searchQuery && (
                  <div className="lg:hidden flex items-center gap-2">
                    <span className="text-sm">"{searchQuery}"</span>
                    <button onClick={clearSearch}>
                      <X className="h-3 w-3" strokeWidth={1.5} />
                    </button>
                  </div>
                )}
                <span className="text-sm text-muted-foreground">
                  {totalElements.toLocaleString()}개
                </span>
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-4">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateParams('sort', option.value)}
                    className={cn(
                      'text-xs transition-opacity hover:opacity-60 hidden sm:block',
                      sort === option.value ? 'font-medium' : 'text-muted-foreground'
                    )}
                  >
                    {option.label}
                  </button>
                ))}

                {/* Mobile Sort */}
                <select
                  value={sort}
                  onChange={(e) => updateParams('sort', e.target.value)}
                  className="sm:hidden text-xs bg-transparent border-0 focus:ring-0"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="p-4 lg:p-8">
            <ProductList products={products} isLoading={isLoading} />

            {/* Load More */}
            <div ref={loadMoreRef} className="py-8 flex justify-center">
              {isFetchingNextPage ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" strokeWidth={1.5} />
              ) : hasNextPage ? (
                <div className="h-4" />
              ) : products.length > 0 ? (
                <p className="text-xs text-muted-foreground">모든 상품을 불러왔습니다</p>
              ) : null}
            </div>
          </div>
        </main>
      </div>
    </AppShell>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <ProductSearchContent />
    </Suspense>
  );
}
