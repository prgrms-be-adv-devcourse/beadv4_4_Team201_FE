import { CuratedProductCard } from './CuratedProductCard';
import type { Product } from '@/types/product';

interface CuratedProduct {
    id: string;
    name: string;
    brandName: string;
    price: number;
    imageUrl: string;
    category?: string;
}

interface AsymmetricGridProps {
    products: CuratedProduct[];
}

export function AsymmetricGrid({ products }: AsymmetricGridProps) {
    return (
        <div className="max-w-screen-xl mx-auto px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-6 md:gap-y-16">
                {products.map((product, index) => {
                    // Pattern: 
                    // Index 0: Large item (2x2)
                    // Index 5: Wide item (2x1) 
                    // Others: Regular (1x1)

                    const isLarge = index === 0;
                    const isWide = index === 5;

                    if (isLarge) {
                        return (
                            <div key={product.id} className="col-span-2 row-span-2">
                                <CuratedProductCard
                                    product={product}
                                    aspectRatio="square"
                                    className="h-full"
                                />
                            </div>
                        );
                    }

                    if (isWide) {
                        return (
                            <div key={product.id} className="col-span-2">
                                <CuratedProductCard
                                    product={product}
                                    aspectRatio="square" // Or customize for wide
                                />
                            </div>
                        );
                    }

                    return (
                        <div key={product.id} className="col-span-1">
                            <CuratedProductCard product={product} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
