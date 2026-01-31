'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

export interface ProductSearchHeaderProps {
  onSearchChange?: (query: string) => void;
}

/**
 * ProductSearchHeader - 29cm Style
 * Clean search bar with minimal styling
 */
export function ProductSearchHeader({ onSearchChange }: ProductSearchHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== initialQuery) {
        const params = new URLSearchParams(searchParams.toString());
        if (query) {
          params.set('q', query);
        } else {
          params.delete('q');
        }
        params.delete('page');

        router.push(`/products?${params.toString()}`);
        onSearchChange?.(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, initialQuery, searchParams, router, onSearchChange]);

  const handleClear = () => {
    setQuery('');
  };

  return (
    <div className="px-4 md:px-8 py-4 border-b border-border">
      <div className="relative">
        <Search
          className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
          strokeWidth={1.5}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="상품 검색..."
          className="w-full pl-8 pr-8 py-2 bg-transparent border-b border-border focus:border-foreground focus:outline-none text-sm"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:opacity-60 transition-opacity"
          >
            <X className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  );
}
