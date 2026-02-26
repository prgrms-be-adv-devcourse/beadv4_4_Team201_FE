export const DEFAULT_PRODUCT_IMAGES: Record<string, string> = {
  electronics: '/images/cat-electronics.png',
  fashion: '/images/cat-fashion.png',
  beauty: '/images/cat-beauty.png',
  home: '/images/cat-home.png',
  living: '/images/cat-home.png',
  sports: 'https://images.unsplash.com/photo-1461896704190-3213c9381024?auto=format&fit=crop&q=80&w=800',
  outdoor: 'https://images.unsplash.com/photo-1461896704190-3213c9381024?auto=format&fit=crop&q=80&w=800',
  books: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=800',
  foods: '/images/cat-foods.png',
  toys: 'https://images.unsplash.com/photo-1532330393533-443990a51d10?auto=format&fit=crop&q=80&w=800',
  pet: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800',
  kitchen: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800',
  default: '/images/placeholder-product.svg',
};

export function getDefaultProductImage(category?: string | null): string {
  if (!category) return DEFAULT_PRODUCT_IMAGES.default;

  const normalizedCategory = category.toLowerCase();
  // Return mapped image or default if not found
  return DEFAULT_PRODUCT_IMAGES[normalizedCategory] || DEFAULT_PRODUCT_IMAGES.default;
}

export function resolveImageUrl(imageKey?: string | null, category?: string | null): string {
  if (!imageKey) return getDefaultProductImage(category);

  // Demo images are served as static files from /public/images/demo/
  if (imageKey.startsWith('demo/')) {
    return `/images/${imageKey}`;
  }

  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
  if (!baseUrl) return getDefaultProductImage(category);

  return `${baseUrl.replace(/\/+$/, '')}/${imageKey.replace(/^\/+/, '')}`;
}

export function handleImageError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  // If error occurs, fall back to the basic default image if not already tried
  if (img.src !== DEFAULT_PRODUCT_IMAGES.default) {
    img.src = DEFAULT_PRODUCT_IMAGES.default;
  }
}
