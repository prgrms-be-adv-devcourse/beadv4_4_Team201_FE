import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { resolveImageUrl } from '@/lib/image';
import { cn } from '@/lib/utils';

interface CuratedProduct {
    id: string;
    name: string;
    brandName: string;
    price: number;
    imageUrl: string;
    category?: string;
    editorial?: string; // Editor's comment
}

interface CuratedProductCardProps {
    product: CuratedProduct;
    aspectRatio?: 'square' | 'portrait';
    className?: string;
}

export function CuratedProductCard({
    product,
    aspectRatio = 'portrait',
    className
}: CuratedProductCardProps) {
    return (
        <div className={cn("group flex flex-col h-full", className)}>
            <div className="relative mb-4 flex-1">
                <Link href={`/products/${product.id}`} className="block h-full">
                    <div className={cn(
                        "relative w-full overflow-hidden bg-secondary h-full",
                        aspectRatio === 'portrait' ? 'aspect-[3/4]' : 'aspect-square'
                    )}>
                        <Image
                            src={resolveImageUrl(product.imageUrl, product.category)}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Overlay text for Editorial */}
                        {product.editorial && (
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <p className="text-sm font-medium leading-snug">
                                    "{product.editorial}"
                                </p>
                            </div>
                        )}
                    </div>
                </Link>
                <button className="absolute top-3 right-3 p-2 text-white/0 group-hover:text-white transition-colors drop-shadow-md">
                    <Heart className="w-6 h-6" />
                </button>
            </div>

            <div className="space-y-1">
                <Link href={`/products/${product.id}`} className="block">
                    <h3 className="text-sm font-bold hover:underline underline-offset-4 decoration-1">
                        {product.brandName}
                    </h3>
                </Link>
                <Link href={`/products/${product.id}`} className="block">
                    <p className="text-sm text-muted-foreground line-clamp-1 group-hover:text-foreground transition-colors">
                        {product.name}
                    </p>
                </Link>
                <p className="text-sm font-medium pt-1">
                    {formatPrice(product.price)}
                </p>

                {product.editorial && (
                    <div className="pt-3 mt-auto">
                        <p className="text-xs text-muted-foreground italic border-l-2 border-black pl-3 py-1">
                            MD's Pick
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
