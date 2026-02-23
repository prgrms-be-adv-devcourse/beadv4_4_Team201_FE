const UNS = 'https://images.unsplash.com';

export const SAMPLE_PRODUCT_IMAGES = {
  TECH: [
    `${UNS}/photo-1590658268037-6bf12f032f55?w=400&q=80`, // airpods
    `${UNS}/photo-1546868871-af0de0ae72be?w=400&q=80`, // smartwatch
    `${UNS}/photo-1544244015-0df4b3ffc6b0?w=400&q=80`, // tablet
    `${UNS}/photo-1505740420928-5e560c06d30e?w=400&q=80`, // headphones
    `${UNS}/photo-1578598336003-1514a3feaaab?w=400&q=80`, // gaming console
    `${UNS}/photo-1517336714731-489689fd1ca8?w=400&q=80`, // laptop
    `${UNS}/photo-1510557880182-3d4d3cba35a5?w=400&q=80`, // phone
    `${UNS}/photo-1606220945770-b5b6c2c55bf1?w=400&q=80`, // earbuds
    `${UNS}/photo-1496181133206-80ce9b88a853?w=400&q=80`, // laptop alt
    `${UNS}/photo-1522338140262-f46f5913618a?w=400&q=80`, // hair dryer
  ],
  BEAUTY: [
    `${UNS}/photo-1571781926291-c477ebfd024b?w=400&q=80`, // perfume
    `${UNS}/photo-1596462502278-27bfdc403348?w=400&q=80`, // makeup
    `${UNS}/photo-1556228578-0d85b1a4d571?w=400&q=80`, // skincare
  ],
  FASHION: [
    `${UNS}/photo-1548036328-c9fa89d128fa?w=400&q=80`, // bag
    `${UNS}/photo-1523170335258-f5ed11844a49?w=400&q=80`, // watch
    `${UNS}/photo-1556306535-0f09a537f0a3?w=400&q=80`, // sunglasses
  ],
  LIVING: [
    `${UNS}/photo-1602028915047-37269d1a73f7?w=400&q=80`, // candle
    `${UNS}/photo-1513519245088-0e12902e35a6?w=400&q=80`, // interior
    `${UNS}/photo-1583847268964-b28dc8f51f92?w=400&q=80`, // home decor
  ],
  FOOD: [
    `${UNS}/photo-1495474472287-4d71bcdd2085?w=400&q=80`, // cafe
    `${UNS}/photo-1488477181946-6428a0291777?w=400&q=80`, // dessert
    `${UNS}/photo-1558618666-fcd25c85f82e?w=400&q=80`, // gift box
  ],
} as const;

export const SAMPLE_PRODUCT_IMAGES_LARGE = {
  TECH: SAMPLE_PRODUCT_IMAGES.TECH.map((url) => url.replace('w=400', 'w=800')),
} as const;

export const SAMPLE_HERO_IMAGES = {
  CURATION: `${UNS}/photo-1513201099705-a9746e1e201f?w=1200&q=80`,
  LIFESTYLE: `${UNS}/photo-1441986300917-64674bd600d8?w=1200&q=80`,
  GIFT: `${UNS}/photo-1549465220-1a8b9238f7e1?w=1200&q=80`,
  LANDING_HERO: `${UNS}/photo-1513885535751-8b9238bd345a?w=1200&q=80`,
} as const;
