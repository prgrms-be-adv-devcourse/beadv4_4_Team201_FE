'use client';

import Image from 'next/image';
import { handleImageError } from '@/lib/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getProduct } from '@/lib/api/products';
import type { Product } from '@/types/product';

interface PopularProductsSectionProps {
    products: Product[];
    title?: string;
    subtitle?: string;
}

export function PopularProductsSection({ 
    products,
    title = '인기 상품',
    subtitle = 'Popular'
}: PopularProductsSectionProps) {
    const queryClient = useQueryClient();
    const displayProducts = products.slice(0, 10);

    const handlePrefetch = (productId: string) => {
        queryClient.prefetchQuery({
            queryKey: queryKeys.product(productId),
            queryFn: () => getProduct(productId),
            staleTime: 60 * 1000,
        });
    };

    return (
        <section className="py-8">
            <div className="max-w-screen-2xl mx-auto w-full">
                {/* Section Header */}
                <div className="flex items-end justify-between px-8 mb-6">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{subtitle}</p>
                        <h2 className="text-xl font-semibold tracking-tight mt-1">{title}</h2>
                    </div>
                    <Link
                        href="/products"
                        className="flex items-center gap-1 text-sm hover:opacity-60 transition-opacity"
                    >
                        전체보기
                        <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                    </Link>
                </div>

                {/* Product Grid - Editorial Style */}
                <div className="px-8 flex flex-col gap-px">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-px bg-border">
                    {displayProducts.map((product) => (
                        <Link
                            key={product.id}
                            href={`/products/${product.id}`}
                            className="group bg-white"
                            onMouseEnter={() => handlePrefetch(product.id)}
                        >
                            {/* Image */}
                            <div className="relative aspect-[4/5] w-full overflow-hidden">
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    sizes="(max-width: 768px) 50vw, 15vw"
                                    onError={handleImageError}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                            </div>

                            {/* Info */}
                            <div className="p-3">
                                <h3 className="text-[11px] font-medium line-clamp-2 min-h-[2rem] group-hover:opacity-60 transition-opacity leading-tight">
                                    {product.name}
                                </h3>
                                <p className="text-xs font-black mt-1 tracking-tight">
                                    {product.price.toLocaleString()}원
                                </p>
                            </div>
                        </Link>
                    ))}
                  </div>
                </div>
            </div>
        </section>
    );
}
