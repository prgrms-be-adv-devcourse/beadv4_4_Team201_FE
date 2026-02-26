export const DEFAULT_PRODUCT_IMAGES: Record<string, string> = {
  electronics: '/images/cat-electronics.png',
  fashion: '/images/cat-fashion.png',
  beauty: '/images/cat-beauty.png',
  home: '/images/cat-home.png',
  living: '/images/cat-home.png',
  sports: '/images/cat-outdoor.png',
  outdoor: '/images/cat-outdoor.png',
  books: '/images/placeholder-product.svg',
  foods: '/images/cat-foods.png',
  toys: '/images/cat-toy.png',
  pet: '/images/cat-pet.png',
  kitchen: '/images/cat-kitchen.png',
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
