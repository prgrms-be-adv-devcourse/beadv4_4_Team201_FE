'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Footer } from '@/components/layout/Footer';
import { ProductList } from '@/features/product/components/ProductList';
import { useProducts, useSearchProducts } from '@/features/product/hooks/useProducts';
import { X } from 'lucide-react';
import type { ProductQueryParams } from '@/types/product';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;

// Categories for sidebar filter
const CATEGORIES = [
  { label: '전체', value: '' },
  { label: '전자기기', value: 'electronics' },
  { label: '뷰티', value: 'beauty' },
  { label: '패션', value: 'fashion' },
  { label: '리빙', value: 'living' },
  { label: '식품', value: 'foods' },
  { label: '완구', value: 'toys' },
  { label: '아웃도어', value: 'outdoor' },
  { label: '반려동물', value: 'pet' },
  { label: '주방', value: 'kitchen' },
];

// Sort options
const SORT_OPTIONS = [
  { label: '추천순', value: 'RELEVANCE' },
  { label: '신상품순', value: 'LATEST' },
  { label: '낮은가격순', value: 'PRICE_ASC' },
  { label: '높은가격순', value: 'PRICE_DESC' },
];

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages: (number | '...')[] = [0];
  const lo = Math.max(1, current - 2);
  const hi = Math.min(total - 2, current + 2);
  if (lo > 1) pages.push('...');
  for (let i = lo; i <= hi; i++) pages.push(i);
  if (hi < total - 2) pages.push('...');
  pages.push(total - 1);
  return pages;
}

function ProductSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const sort = (searchParams.get('sort') as ProductQueryParams['sort']) || 'RELEVANCE';
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 0;

  const [customMinPrice, setCustomMinPrice] = useState('');
  const [customMaxPrice, setCustomMaxPrice] = useState('');

  const applyCustomPrice = () => {
    updateMultipleParams({ minPrice: customMinPrice, maxPrice: customMaxPrice, page: '0' });
  };

  const searchEnabled = !!searchQuery;

  const searchResult = useSearchProducts({
    q: searchQuery,
    category: category || undefined,
    page,
    size: PAGE_SIZE,
  });

  const productsResult = useProducts({
    category: category || undefined,
    minPrice,
    maxPrice,
    sort,
    page,
    size: PAGE_SIZE,
  });

  const result = searchEnabled ? searchResult : productsResult;
  const products = result.data?.items || [];
  const isLoading = result.isLoading;
  const totalElements = result.data?.page?.totalElements || 0;
  const totalPages = result.data?.page?.totalPages || 0;

  // Update URL params
  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // 필터 바뀌면 페이지 리셋
    if (key !== 'page') params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  const updateMultipleParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    router.push(`/products?${params.toString()}`);
  };

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (p === 0) {
      params.delete('page');
    } else {
      params.set('page', p.toString());
    }
    router.push(`/products?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearSearch = () => {
    router.push('/products');
  };

  return (
    <AppShell headerVariant="main">
      <div className="max-w-screen-2xl mx-auto px-8">

        <div className="flex min-h-screen gap-12">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-40 flex-shrink-0 pt-4 sticky top-40 h-[calc(100vh-10rem)] overflow-y-auto no-scrollbar">
            {/* Categories */}
            <div className="mb-12">
              <h3 className="text-[10px] font-black text-black mb-6 uppercase tracking-widest">
                Category
              </h3>
              <ul className="space-y-3">
                {CATEGORIES.map((cat) => (
                  <li key={cat.value}>
                    <button
                      onClick={() => updateParams('category', cat.value)}
                      className={cn(
                        'text-xs transition-opacity hover:opacity-60 text-left w-full',
                        category === cat.value ? 'font-black text-black underline underline-offset-4' : 'text-gray-400 font-medium'
                      )}
                    >
                      {cat.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Range */}
            <div className="mb-12">
              <h3 className="text-[10px] font-black text-black mb-6 uppercase tracking-widest">
                Price
              </h3>
              {/* Custom Price Input */}
              <div className="flex items-center gap-1 mb-4">
                <input
                  type="number"
                  placeholder="최소"
                  value={customMinPrice}
                  onChange={(e) => setCustomMinPrice(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyCustomPrice()}
                  className="flex-1 min-w-0 px-2 py-1.5 border border-gray-200 text-[10px] text-center focus:outline-none focus:border-black"
                />
                <span className="text-[10px] text-gray-300">—</span>
                <input
                  type="number"
                  placeholder="최대"
                  value={customMaxPrice}
                  onChange={(e) => setCustomMaxPrice(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyCustomPrice()}
                  className="flex-1 min-w-0 px-2 py-1.5 border border-gray-200 text-[10px] text-center focus:outline-none focus:border-black"
                />
              </div>
              <button
                onClick={applyCustomPrice}
                className="w-full py-1.5 mb-5 border border-black text-[10px] font-bold hover:bg-black hover:text-white transition-colors"
              >
                적용
              </button>
              <ul className="space-y-3">
                {[
                  { label: '전체', min: '', max: '' },
                  { label: '~5만원', min: '', max: '50000' },
                  { label: '5~10만원', min: '50000', max: '100000' },
                  { label: '10만원~', min: '100000', max: '' },
                ].map((range) => {
                  const isActive = range.label === '전체'
                    ? (!minPrice && !maxPrice)
                    : (range.min === (minPrice?.toString() || '') && range.max === (maxPrice?.toString() || ''));

                  return (
                    <li key={range.label}>
                      <button
                        onClick={() => {
                          setCustomMinPrice('');
                          setCustomMaxPrice('');
                          updateMultipleParams({ minPrice: range.min, maxPrice: range.max, page: '0' });
                        }}
                        className={cn(
                          'text-xs transition-opacity hover:opacity-60 text-left w-full',
                          isActive ? 'font-black text-black underline underline-offset-4' : 'text-gray-400 font-medium'
                        )}
                      >
                        {range.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 pb-20">
            {/* Toolbar Area */}
            <div className="flex items-center justify-between mb-8 pt-4">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black tracking-widest">
                  {totalElements.toLocaleString()} ITEMS
                </span>
                {searchQuery && (
                  <div className="flex items-center gap-2 bg-black text-white px-3 py-1 text-[10px] font-bold">
                    <span>"{searchQuery}"</span>
                    <button onClick={clearSearch}>
                      <X className="h-3 w-3" strokeWidth={1.5} />
                    </button>
                  </div>
                )}
                {(minPrice || maxPrice) && (
                  <div className="flex items-center gap-2 bg-black text-white px-3 py-1 text-[10px] font-bold">
                    <span>{minPrice ? `${minPrice.toLocaleString()}원` : '0원'} ~ {maxPrice ? `${maxPrice.toLocaleString()}원` : ''}</span>
                    <button onClick={() => {
                      setCustomMinPrice('');
                      setCustomMaxPrice('');
                      updateMultipleParams({ minPrice: '', maxPrice: '', page: '0' });
                    }}>
                      <X className="h-3 w-3" strokeWidth={1.5} />
                    </button>
                  </div>
                )}
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-6">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateParams('sort', option.value)}
                    className={cn(
                      'text-[10px] font-bold tracking-tight transition-colors hidden sm:block',
                      sort === option.value ? 'text-black' : 'text-gray-300 hover:text-gray-500'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            <ProductList products={products} isLoading={isLoading} />

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 py-16">
                <button
                  disabled={page === 0}
                  onClick={() => goToPage(0)}
                  className="px-3 py-1.5 text-[10px] font-bold border border-gray-200 hover:border-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  처음
                </button>
                <button
                  disabled={page === 0}
                  onClick={() => goToPage(page - 1)}
                  className="px-3 py-1.5 text-[10px] font-bold border border-gray-200 hover:border-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  이전
                </button>

                {getPageNumbers(page, totalPages).map((p, i) =>
                  p === '...'
                    ? <span key={`ellipsis-${i}`} className="px-2 text-[10px] text-gray-300 font-bold">···</span>
                    : <button
                      key={p}
                      onClick={() => goToPage(p as number)}
                      className={cn(
                        'px-3 py-1.5 text-[10px] font-bold border transition-colors',
                        p === page
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 hover:border-black'
                      )}
                    >
                      {(p as number) + 1}
                    </button>
                )}

                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => goToPage(page + 1)}
                  className="px-3 py-1.5 text-[10px] font-bold border border-gray-200 hover:border-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  다음
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => goToPage(totalPages - 1)}
                  className="px-3 py-1.5 text-[10px] font-bold border border-gray-200 hover:border-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  끝
                </button>
              </div>
            )}

            {/* End message */}
            {!isLoading && products.length > 0 && totalPages <= 1 && (
              <div className="py-16 flex justify-center">
                <p className="text-[10px] font-black tracking-widest text-gray-300">END OF PRODUCTS</p>
              </div>
            )}

            {/* Footer */}
            <Footer />
          </main>
        </div>
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
