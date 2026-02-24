'use client';

import Image from 'next/image';
import { handleImageError } from '@/lib/image';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getProduct } from '@/lib/api/products';
import type { Product } from '@/types/product';
import { cn } from '@/lib/utils/cn';
import { Heart } from 'lucide-react';
import { useWishlistItem } from '@/features/wishlist/hooks/useWishlistItem';

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
  const { isInWishlist, toggleWishlist, isLoading: wishlistLoading } = useWishlistItem(product.id);

  const handleMouseEnter = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.product(product.id),
      queryFn: () => getProduct(product.id),
      staleTime: 60 * 1000,
    });
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist();
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

        {/* Wishlist Heart Overlay */}
        <button
          onClick={handleWishlistClick}
          disabled={wishlistLoading}
          className={cn(
            "absolute top-2.5 right-2.5 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm shadow-black/5 active:scale-90 transition-all z-10",
            "opacity-0 group-hover:opacity-100 focus:opacity-100"
          )}
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-colors",
              isInWishlist ? "fill-red-500 text-red-500" : "text-black/30 group-hover:text-black/50"
            )}
            strokeWidth={2}
          />
        </button>
      </div>

      {/* Product Info */}
      <div className="px-1 space-y-1">
        <h3 className="text-xs font-medium text-gray-900 line-clamp-2 leading-tight group-hover:opacity-60 transition-opacity">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <p className={cn(
            "text-sm font-black tracking-tighter tabular-nums",
            product.isSoldout && "text-gray-400"
          )}>
            {product.price.toLocaleString()}원
          </p>
          {product.isSoldout && (
            <span className="text-[10px] font-bold text-white bg-black px-1.5 py-0.5">
              품절
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
