'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { SlidersHorizontal } from 'lucide-react';

/**
 * ProductFilters - 29cm Style
 * Clean filter sheet with minimal styling
 */
export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }

    if (minPrice) {
      params.set('minPrice', minPrice);
    } else {
      params.delete('minPrice');
    }

    if (maxPrice) {
      params.set('maxPrice', maxPrice);
    } else {
      params.delete('maxPrice');
    }

    params.delete('page');

    router.push(`/products?${params.toString()}`);
    setOpen(false);
  };

  const handleReset = () => {
    setCategory('');
    setMinPrice('');
    setMaxPrice('');

    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('page');

    router.push(`/products?${params.toString()}`);
    setOpen(false);
  };

  const hasActiveFilters = category || minPrice || maxPrice;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex items-center gap-2 text-sm hover:opacity-60 transition-opacity">
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
          필터
          {hasActiveFilters && (
            <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle className="text-lg font-semibold tracking-tight">필터</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            카테고리와 가격 범위로 필터링
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-8">
          {/* Category Filter */}
          <div className="space-y-3">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              카테고리
            </Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-0 bg-transparent border-0 border-b border-border focus:border-foreground focus:outline-none text-sm"
            >
              <option value="">전체</option>
              <option value="electronics">전자제품</option>
              <option value="fashion">패션</option>
              <option value="beauty">뷰티</option>
              <option value="home">홈/리빙</option>
              <option value="sports">스포츠</option>
              <option value="books">도서</option>
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-4">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              가격 범위
            </Label>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">최소 가격</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full h-10 px-0 bg-transparent border-0 border-b border-border focus:border-foreground focus:outline-none text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">최대 가격</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="1,000,000"
                  min="0"
                  className="w-full h-10 px-0 bg-transparent border-0 border-b border-border focus:border-foreground focus:outline-none text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-8 gap-3">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            초기화
          </Button>
          <Button onClick={handleApply} className="flex-1">
            적용
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
