import { http, HttpResponse, HttpHandler } from 'msw';
import { products, popularProducts, productDetails } from '../data/products';

export const productsHandlers: HttpHandler[] = [
  http.get('**/api/v2/products', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');

    const start = page * size;
    const end = start + size;
    const paginatedProducts = products.slice(start, end);

    return HttpResponse.json({
      items: paginatedProducts,
      page: {
        page,
        size,
        totalElements: products.length,
        totalPages: Math.ceil(products.length / size),
        hasNext: end < products.length,
        hasPrevious: page > 0,
      },
    });
  }),

  http.get('**/api/v2/products/search', ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');

    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(q.toLowerCase())
    );

    const start = page * size;
    const end = start + size;
    const paginatedProducts = filtered.slice(start, end);

    return HttpResponse.json({
      items: paginatedProducts,
      page: {
        page,
        size,
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size),
        hasNext: end < filtered.length,
        hasPrevious: page > 0,
      },
    });
  }),

  http.get('**/api/v2/products/popular', ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '8');
    return HttpResponse.json({ items: popularProducts.slice(0, limit) });
  }),

  http.get('**/api/v2/products/:productId', ({ params }) => {
    const { productId } = params;
    const detail = productDetails[productId as string];
    if (!detail) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(detail);
  }),

  http.get('**/api/v2/products/my', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '10');
    const status = url.searchParams.get('status');

    const sellerProducts = products.map((p, i) => ({
      id: Number(p.id.replace('product-', '')),
      name: p.name,
      description: `판매자용 상품 설명 ${i + 1}`,
      price: p.price,
      stock: 10 + i,
      category: 'CLOTHING',
      imageKey: `image-key-${i}`,
      status: status || (i % 3 === 0 ? 'DRAFT' : 'ACTIVE'),
      createdAt: new Date().toISOString(),
    }));

    const start = page * size;
    const end = start + size;
    const content = sellerProducts.slice(start, end);

    return HttpResponse.json({
      content,
      totalElements: sellerProducts.length,
      totalPages: Math.ceil(sellerProducts.length / size),
      size,
      number: page,
    });
  }),

  http.get('**/api/v2/products/my/:productId', ({ params }) => {
    const { productId } = params;
    return HttpResponse.json({
      id: Number(productId),
      name: `Mock Product ${productId}`,
      description: '판매자 전용 상품 상세 설명',
      price: 50000,
      stock: 100,
      category: 'ELECTRONICS',
      imageKey: 'mock-image-key',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    });
  }),

  http.patch('**/api/v2/products/my/:productId', async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: Number(params.productId),
      ...body,
    });
  }),

  http.get('**/api/v2/products/my/stock-histories', ({ request }) => {
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '10');

    const histories = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      productId: Number(productId) || (i % 5) + 1,
      changeType: i % 2 === 0 ? 'ORDER_DEDUCT' : 'MANUAL_ADJUST',
      delta: i % 2 === 0 ? -1 : 5,
      beforeStock: 100,
      afterStock: i % 2 === 0 ? 99 : 105,
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    }));

    const start = page * size;
    const end = start + size;
    const content = histories.slice(start, end);

    return HttpResponse.json({
      content,
      totalElements: histories.length,
      totalPages: Math.ceil(histories.length / size),
      size,
      number: page,
    });
  }),
];
