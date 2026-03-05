import { http, HttpResponse, HttpHandler } from 'msw';
import { myWishlist, friendsWishlists, wishlists } from '../data/wishlists';
import { products } from '../data/products';

export const wishlistsHandlers: HttpHandler[] = [
  http.get('**/api/v2/wishlists/me', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');
    const category = url.searchParams.get('category');
    const status = url.searchParams.get('status');

    let filteredItems = [...myWishlist.items];

    if (category) {
      filteredItems = filteredItems.filter(item =>
        item.product.category?.toUpperCase() === category.toUpperCase()
      );
    }
    if (status) {
      filteredItems = filteredItems.filter(item => item.status === status);
    }

    const start = page * size;
    const end = start + size;
    const paginatedItems = filteredItems.slice(start, end).map(item => ({
      id: parseInt(item.id.replace('wish-item-', '').replace('extra-', '100'), 10),
      wishlistId: 3,
      productId: parseInt(item.product.id.replace('product-', ''), 10),
      productName: item.product.name,
      price: item.product.price,
      imageKey: item.product.imageUrl.includes('/') ? item.product.imageUrl.split('/').pop() : 'mock-key',
      isSoldout: item.product.isSoldout || false,
      isActive: item.product.isActive !== false,
      sellerNickname: item.product.sellerNickname || 'Seller',
      category: item.product.category?.toUpperCase() || 'GENERAL',
      status: item.status,
      fundingId: item.fundingId,
      addedAt: item.createdAt,
    }));

    return HttpResponse.json({
      id: 3,
      memberId: 1,
      items: paginatedItems,
      itemCount: filteredItems.length,
      page: {
        pageNumber: page,
        pageSize: size,
        totalElements: filteredItems.length,
        totalPages: Math.ceil(filteredItems.length / size),
        isFirst: page === 0,
        isLast: end >= filteredItems.length,
      },
    });
  }),

  http.get('**/api/v2/wishlists/search', ({ request }) => {
    const url = new URL(request.url);
    const nickname = url.searchParams.get('nickname');

    const publicWishlists = wishlists.filter((w) => w.visibility === 'PUBLIC');
    const summaries = publicWishlists.map((w) => ({
      memberId: parseInt(w.memberId.replace('member-', '').replace('dev', '0'), 10),
      nickname: w.member.nickname || 'Unknown',
    }));

    const filtered = nickname
      ? summaries.filter((m) => m.nickname.includes(nickname))
      : summaries;

    return HttpResponse.json({ result: 'SUCCESS', data: filtered });
  }),

  http.get('**/api/v2/wishlists/:memberId', ({ params }) => {
    const { memberId } = params;
    const wishlist = wishlists.find((w) => w.memberId === memberId);
    if (!wishlist) {
      return HttpResponse.json({ result: 'SUCCESS', data: null });
    }
    if (wishlist.visibility !== 'PUBLIC') {
      return HttpResponse.json({ result: 'SUCCESS', data: null });
    }
    const publicResponse = {
      memberId: parseInt(wishlist.memberId.replace('member-', '').replace('dev', '0'), 10),
      nickname: wishlist.member.nickname || 'Unknown',
      items: wishlist.items.map((item) => ({
        wishlistItemId: parseInt(item.id.replace('wish-item-', ''), 10),
        productId: parseInt(item.productId.replace('product-', ''), 10),
        productName: item.product.name,
        price: item.product.price,
        status: item.status,
        fundingId: item.fundingId,
        addedAt: item.createdAt,
      })),
    };
    return HttpResponse.json({ result: 'SUCCESS', data: publicResponse });
  }),

  http.patch('**/api/v2/wishlists/me/settings', async ({ request }) => {
    const body = await request.json();
    const { visibility } = body as { visibility: string };

    myWishlist.visibility = visibility as 'PUBLIC' | 'PRIVATE';

    return HttpResponse.json({
      ...myWishlist,
      visibility,
    });
  }),

  http.post('**/api/v2/wishlists/me/items/add', async ({ request }) => {
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');

    if (!productId) {
      return new HttpResponse(null, { status: 400 });
    }

    const product = products.find((p) => p.id === productId || p.id === `product-${productId}`);
    if (!product) {
      return new HttpResponse(null, { status: 404 });
    }

    const newItem = {
      id: `wish-item-${Date.now()}`,
      wishlistId: myWishlist.id,
      productId: product.id,
      product,
      status: 'PENDING' as const,
      fundingId: null,
      createdAt: new Date().toISOString(),
    };

    myWishlist.items.unshift(newItem);
    myWishlist.itemCount++;

    return new HttpResponse(null, { status: 204 });
  }),

  http.delete('**/api/v2/wishlists/items/:itemId', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('**/api/v2/friends/wishlists', ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '5');

    const friendWishlistsData = friendsWishlists.slice(0, limit).map((w) => ({
      member: w.member,
      wishlist: w,
      previewItems: w.items.slice(0, 3),
    }));

    return HttpResponse.json({ items: friendWishlistsData });
  }),
];
