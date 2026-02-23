'use client';

import Image from 'next/image';
import { handleImageError } from '@/lib/image';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getProduct } from '@/lib/api/products';
import type { Product } from '@/types/product';
import { cn } from '@/lib/utils/cn';

export interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  className?: string;
}

/**
 * ProductCard - Display product in grid layout
 * Used in product list and popular products section
 */
export function ProductCard({ product, onClick, className }: ProductCardProps) {
  const queryClient = useQueryClient();

  const handleMouseEnter = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.product(product.id),
      queryFn: () => getProduct(product.id),
      staleTime: 60 * 1000,
    });
  };

  return (
    <div
      className={cn(
        'group cursor-pointer flex flex-col',
        className
      )}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
    >
      {/* Product Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100 mb-3">
        <Image
          src={product.imageUrl || '/images/placeholder-product.svg'}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 15vw"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </div>

      {/* Product Info */}
      <div className="px-1 space-y-1">
        <h3 className="text-xs font-medium text-gray-900 line-clamp-2 leading-tight group-hover:opacity-60 transition-opacity">
          {product.name}
        </h3>
        <p className="text-sm font-black tracking-tighter tabular-nums mt-1">
          {product.price.toLocaleString()}원
        </p>
      </div>
    </div>
  );
}
