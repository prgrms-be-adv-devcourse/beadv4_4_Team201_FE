'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Share2, Minus, Plus, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { AppShell } from '@/components/layout/AppShell';
import { Footer } from '@/components/layout/Footer';
import { useProductDetail } from '@/features/product/hooks/useProductDetail';
import { useWishlistItem } from '@/features/wishlist/hooks/useWishlistItem';
import { useCart } from '@/features/cart/hooks/useCart';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils/format';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: product, isLoading, error } = useProductDetail(id);
  const { isInWishlist, toggleWishlist, isLoading: wishlistLoading } = useWishlistItem(id);
  const { addToCart, isLoading: cartLoading } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: `${product?.name} - ${formatCurrency(product?.price || 0)}`,
          url: window.location.href,
        });
      } catch {
        // User cancelled sharing
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('링크가 복사되었습니다');
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart({ productId: id, quantity });
      toast.success('장바구니에 담았습니다');
    } catch {
      toast.error('장바구니 담기에 실패했습니다');
    }
  };

  const handleBuyNow = async () => {
    try {
      await addToCart({ productId: id, quantity });
      router.push('/checkout');
    } catch {
      toast.error('주문 처리 중 오류가 발생했습니다');
    }
  };

  if (error) {
    return (
      <AppShell headerVariant="detail">
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
          <div className="text-6xl mb-6">😢</div>
          <h2 className="text-xl font-medium mb-2">상품을 찾을 수 없습니다</h2>
          <p className="text-muted-foreground mb-6">요청하신 상품이 존재하지 않거나 삭제되었습니다.</p>
          <Button variant="outline" onClick={() => router.push('/products')}>
            상품 목록으로 돌아가기
          </Button>
        </div>
        <Footer />
      </AppShell>
    );
  }

  if (isLoading || !product) {
    return (
      <AppShell headerVariant="detail">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </AppShell>
    );
  }

  const images = product.images?.length > 0 
    ? product.images 
    : [product.imageUrl || '/images/placeholder-product.svg'];

  return (
    <AppShell headerVariant="detail">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        {/* Breadcrumb */}
        <nav className="py-4 text-sm text-muted-foreground">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-foreground">홈</Link></li>
            <li>/</li>
            <li><Link href="/products" className="hover:text-foreground">상품</Link></li>
            <li>/</li>
            <li className="text-foreground truncate max-w-[200px]">{product.name}</li>
          </ol>
        </nav>

        {/* Product Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 pb-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-50 overflow-hidden">
              <Image
                src={images[currentImageIndex]}
                alt={product.name}
                fill
                className="object-contain"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center transition-all"
                    aria-label="이전 이미지"
                  >
                    <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center transition-all"
                    aria-label="다음 이미지"
                  >
                    <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Grid */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.slice(0, 5).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      "relative aspect-square bg-gray-50 overflow-hidden border-2 transition-all",
                      currentImageIndex === index ? "border-black" : "border-transparent hover:border-gray-300"
                    )}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} - ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="20vw"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            {/* Brand & Name */}
            <div>
              {product.brandName && (
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">
                  {product.brandName}
                </p>
              )}
              <h1 className="text-2xl md:text-3xl font-bold leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Price */}
            <div className="text-3xl md:text-4xl font-bold">
              {formatCurrency(product.price)}
            </div>

            <Separator />

            {/* Description */}
            {product.description && (
              <div className="text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </div>
            )}

            {/* Delivery Info */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">배송비</span>
                <span className="font-medium">무료배송</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">배송예정</span>
                <span className="font-medium">내일 도착 예정</span>
              </div>
            </div>

            <Separator />

            {/* Quantity Selector */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">수량</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <span className="w-8 text-center font-medium tabular-nums">{quantity}</span>
                <button
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Total Price */}
            <div className="flex items-center justify-between py-4 border-t border-b">
              <span className="font-medium">총 상품금액</span>
              <span className="text-2xl font-bold">{formatCurrency(product.price * quantity)}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {/* Wishlist Button */}
              <Button
                variant="outline"
                size="lg"
                className="w-14 flex-shrink-0"
                onClick={() => toggleWishlist()}
                disabled={wishlistLoading}
              >
                <Heart className={cn("w-5 h-5", isInWishlist && "fill-red-500 text-red-500")} strokeWidth={1.5} />
              </Button>

              {/* Share Button */}
              <Button
                variant="outline"
                size="lg"
                className="w-14 flex-shrink-0"
                onClick={handleShare}
              >
                <Share2 className="w-5 h-5" strokeWidth={1.5} />
              </Button>

              {/* Add to Cart Button */}
              <Button
                variant="outline"
                size="lg"
                className="flex-1 font-medium"
                onClick={handleAddToCart}
                disabled={cartLoading}
              >
                <ShoppingBag className="w-5 h-5 mr-2" strokeWidth={1.5} />
                장바구니 담기
              </Button>
            </div>

            {/* Buy Now Button */}
            <Button
              size="lg"
              className="w-full bg-black hover:bg-gray-800 text-white font-bold text-lg h-14"
              onClick={handleBuyNow}
              disabled={cartLoading}
            >
              바로 구매하기
            </Button>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="py-12 border-t">
          <h2 className="text-xl font-bold mb-6">상품 상세 정보</h2>
          <div className="prose prose-gray max-w-none">
            {product.description ? (
              <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            ) : (
              <p className="text-muted-foreground">상세 정보가 없습니다.</p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </AppShell>
  );
}
