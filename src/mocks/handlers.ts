import { http, HttpResponse, passthrough } from 'msw';
import {
  currentUser,
  members,
} from './data/members';
import {
  products,
  productDetails,
  popularProducts,
} from './data/products';
import {
  fundings,
  fundingParticipants,

  myParticipatedFundings,
  myReceivedFundings,
  type Funding,
} from './data/fundings';
import {
  myWishlist,
  friendsWishlists,
  wishlists,
} from './data/wishlists';

// Mock wallet data
let walletBalance = 1000000;

interface WalletTransaction {
  id: string;
  type: 'CHARGE' | 'WITHDRAW' | 'PAYMENT';
  amount: number;
  balanceAfter: number;
  description: string;
  relatedId: string | null;
  createdAt: string;
}

let walletTransactions: WalletTransaction[] = [
  {
    id: 'tx-1',
    type: 'CHARGE',
    amount: 500000,
    balanceAfter: 500000,
    description: '포인트 충전',
    relatedId: null,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tx-2',
    type: 'PAYMENT',
    amount: -50000,
    balanceAfter: 450000,
    description: '펀딩 참여',
    relatedId: 'funding-1',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tx-3',
    type: 'CHARGE',
    amount: 600000,
    balanceAfter: 1050000,
    description: '포인트 충전',
    relatedId: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tx-4',
    type: 'PAYMENT',
    amount: -50000,
    balanceAfter: 1000000,
    description: '펀딩 참여',
    relatedId: 'funding-2',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock cart data
interface CartItem {
  id: string;
  cartId: string;
  fundingId: string;
  funding: Funding;
  amount: number;
  selected: boolean;
  isNewFunding: boolean;
  createdAt: string;
}

let cartItems: CartItem[] = [];

export const handlers = [
  // ============================================
  // AUTH & MEMBERS (Mocked for E2E testing)
  // ============================================
  http.get('**/api/v2/auth/me', () => {
    return HttpResponse.json(currentUser);
  }),

  http.post('**/api/v2/auth/login', () => {
    return HttpResponse.json({ success: true });
  }),

  http.post('**/api/v2/auth/logout', () => {
    return HttpResponse.json({ success: true });
  }),

  http.get('**/api/v2/members/me', () => {
    return HttpResponse.json(currentUser);
  }),

  http.post('**/api/v2/members/signup', async ({ request }) => {
    const body = await request.json();
    const { nickname } = body as { nickname: string };
    const updatedUser = { ...currentUser, nickname };
    return HttpResponse.json(updatedUser, { status: 201 });
  }),

  http.patch('**/api/v2/members/me', async ({ request }) => {
    const body = await request.json();
    const updatedUser = { ...currentUser, ...(body as object) };
    return HttpResponse.json(updatedUser);
  }),
  // Wallet endpoints are mocked below
  http.all('**/api/v2/payments/**', () => passthrough()),
  http.all('**/api/auth/**', () => passthrough()),

  // ============================================
  // HOME
  // ============================================
  http.get('**/api/v2/home', () => {
    const friendWishlistsData = friendsWishlists.slice(0, 5).map((w) => ({
      member: w.member,
      wishlist: w,
      previewItems: w.items.slice(0, 3),
    }));

    return HttpResponse.json({
      member: currentUser,
      myFundings: myParticipatedFundings.slice(0, 10),
      friendsWishlists: friendWishlistsData,
      popularProducts: popularProducts.slice(0, 8),
      walletBalance,
    });
  }),

  // ============================================
  // WALLET
  // ============================================
  http.get('**/api/v2/wallet/balance', () => {
    return HttpResponse.json({
      walletId: 1,
      balance: walletBalance,
    });
  }),

  http.get('**/api/v2/wallet/history', ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');

    let filtered = walletTransactions;
    if (type) {
      filtered = walletTransactions.filter((t) => t.type === type);
    }

    // Sort by createdAt descending
    filtered = [...filtered].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const start = page * size;
    const end = start + size;
    const paginated = filtered.slice(start, end);

    return HttpResponse.json({
      result: 'SUCCESS',
      data: {
        content: paginated,
        pageable: {
          pageNumber: page,
          pageSize: size,
          sort: { empty: true, sorted: false, unsorted: true },
          offset: page * size,
          paged: true,
          unpaged: false,
        },
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size),
        last: end >= filtered.length,
        size,
        number: page,
        sort: { empty: true, sorted: false, unsorted: true },
        numberOfElements: paginated.length,
        first: page === 0,
        empty: paginated.length === 0,
      },
    });
  }),

  http.post('**/api/v2/wallet/charge', async ({ request }) => {
    const body = await request.json();
    const { amount } = body as { amount: number };

    walletBalance += amount;

    const newTransaction: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'CHARGE',
      amount,
      balanceAfter: walletBalance,
      description: '포인트 충전',
      relatedId: null,
      createdAt: new Date().toISOString(),
    };
    walletTransactions.unshift(newTransaction);

    return HttpResponse.json({
      chargeId: newTransaction.id,
      paymentUrl: 'https://payment.example.com/mock',
      amount,
    });
  }),

  http.post('**/api/v2/wallet/withdraw', async ({ request }) => {
    const body = await request.json();
    const { amount, bankCode } = body as {
      amount: number;
      bankCode: string;
    };

    if (amount > walletBalance) {
      return HttpResponse.json(
        { error: 'INSUFFICIENT_BALANCE', message: '잔액이 부족합니다.' },
        { status: 400 }
      );
    }

    walletBalance -= amount;

    const bankNames: Record<string, string> = {
      '004': 'KB국민은행',
      '088': '신한은행',
      '020': '우리은행',
      '081': '하나은행',
    };

    const newTransaction: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'WITHDRAW',
      amount: -amount,
      balanceAfter: walletBalance,
      description: `${bankNames[bankCode] || '은행'} 출금`,
      relatedId: null,
      createdAt: new Date().toISOString(),
    };
    walletTransactions.unshift(newTransaction);

    return HttpResponse.json({
      walletId: 1,
      balance: walletBalance,
      withdrawnAmount: amount,
      transactionId: newTransaction.id,
      status: 'PENDING',
    });
  }),

  // ============================================
  // WISHLISTS
  // ============================================
  http.get('**/api/v2/wishlists/me', () => {
    return HttpResponse.json(myWishlist);
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
        addedAt: item.createdAt,
      })),
    };
    return HttpResponse.json({ result: 'SUCCESS', data: publicResponse });
  }),

  http.patch('**/api/v2/wishlists/visibility', async ({ request }) => {
    const body = await request.json();
    const updatedWishlist = {
      ...myWishlist,
      visibility: (body as { visibility: string }).visibility,
    };
    return HttpResponse.json(updatedWishlist);
  }),

  http.post('**/api/v2/wishlists/items', async ({ request }) => {
    const body = await request.json();
    const { productId } = body as { productId: string };
    const product = products.find((p) => p.id === productId);
    if (!product) {
      return new HttpResponse(null, { status: 404 });
    }
    const newItem = {
      id: `wish-item-${Date.now()}`,
      wishlistId: myWishlist.id,
      productId: product.id,
      product,
      status: 'AVAILABLE' as const,
      fundingId: null,
      createdAt: new Date().toISOString(),
    };
    return HttpResponse.json(newItem, { status: 201 });
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

  // ============================================
  // PRODUCTS
  // ============================================
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

  // ============================================
  // SELLER PRODUCTS & STOCK
  // ============================================
  http.get('**/api/v2/products/my', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '10');
    const status = url.searchParams.get('status');

    let sellerProducts = products.map((p, i) => ({
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
    // Mock single product for seller
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

  // ============================================
  // FUNDINGS
  // ============================================
  http.get('**/api/v2/fundings', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');

    let filtered = fundings;
    if (status) {
      filtered = fundings.filter((f) => f.status === status);
    }

    const start = page * size;
    const end = start + size;
    const paginated = filtered.slice(start, end);

    return HttpResponse.json({
      items: paginated,
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

  http.post('**/api/v2/fundings', async ({ request }) => {
    const body = await request.json();
    const { wishItemId } = body as { wishItemId: string };

    const newFunding: Funding = {
      id: `funding-${Date.now()}`,
      wishItemId,
      product: products[0],
      organizerId: currentUser.id,
      organizer: {
        id: currentUser.id,
        nickname: currentUser.nickname,
        avatarUrl: currentUser.avatarUrl,
      },
      recipientId: members[1].id,
      recipient: {
        id: members[1].id,
        nickname: members[1].nickname,
        avatarUrl: members[1].avatarUrl,
      },
      targetAmount: products[0].price,
      currentAmount: 0,
      status: 'PENDING',
      participantCount: 0,
      expiresAt: new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000
      ).toISOString(),
      createdAt: new Date().toISOString(),
    };

    return HttpResponse.json(newFunding, { status: 201 });
  }),

  http.get('**/api/v2/fundings/:fundingId', ({ params }) => {
    const { fundingId } = params;
    const funding = fundings.find((f) => f.id === fundingId);
    if (!funding) {
      return new HttpResponse(null, { status: 404 });
    }

    const participants = fundingParticipants[fundingId as string] || [];
    const myParticipation = participants.find(
      (p) => p.memberId === currentUser.id
    );

    return HttpResponse.json({
      ...funding,
      participants: participants.slice(0, 5),
      myParticipation: myParticipation || null,
    });
  }),

  http.post('**/api/v2/fundings/:fundingId/accept', ({ params }) => {
    const { fundingId } = params;
    const funding = fundings.find((f) => f.id === fundingId);
    if (!funding) {
      return new HttpResponse(null, { status: 404 });
    }
    const updatedFunding = { ...funding, status: 'ACCEPTED' as const };
    return HttpResponse.json(updatedFunding);
  }),

  http.post('**/api/v2/fundings/:fundingId/refuse', ({ params }) => {
    const { fundingId } = params;
    const funding = fundings.find((f) => f.id === fundingId);
    if (!funding) {
      return new HttpResponse(null, { status: 404 });
    }
    const updatedFunding = { ...funding, status: 'REFUSED' as const };
    return HttpResponse.json(updatedFunding);
  }),

  http.get('**/api/v2/fundings/:fundingId/participants', ({ request, params }) => {
    const { fundingId } = params;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');

    const participants = fundingParticipants[fundingId as string] || [];
    const start = page * size;
    const end = start + size;
    const paginated = participants.slice(start, end);

    return HttpResponse.json({
      items: paginated,
      page: {
        page,
        size,
        totalElements: participants.length,
        totalPages: Math.ceil(participants.length / size),
        hasNext: end < participants.length,
        hasPrevious: page > 0,
      },
    });
  }),



  http.get('**/api/v2/fundings/my/participated', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');

    let filtered = myParticipatedFundings;
    if (status) {
      filtered = myParticipatedFundings.filter((f) => f.status === status);
    }

    const start = page * size;
    const end = start + size;
    const paginated = filtered.slice(start, end);

    return HttpResponse.json({
      items: paginated,
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

  http.get('**/api/v2/fundings/my/received', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');

    let filtered = myReceivedFundings;
    if (status) {
      filtered = myReceivedFundings.filter((f) => f.status === status);
    }

    const start = page * size;
    const end = start + size;
    const paginated = filtered.slice(start, end);

    return HttpResponse.json({
      items: paginated,
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

  // ============================================
  // CART
  // ============================================
  http.get('**/api/v2/cart', () => {
    const selectedCount = cartItems.filter((item) => item.selected).length;
    const totalAmount = cartItems
      .filter((item) => item.selected)
      .reduce((sum, item) => sum + item.amount, 0);

    return HttpResponse.json({
      id: 'cart-1',
      memberId: currentUser.id,
      items: cartItems,
      selectedCount,
      totalAmount,
    });
  }),

  http.post('**/api/v2/cart/items', async ({ request }) => {
    const body = await request.json();
    const { fundingId, wishItemId, amount } = body as {
      fundingId?: string;
      wishItemId?: string;
      amount: number;
    };

    let funding: Funding | undefined;
    let isNewFunding = false;

    if (fundingId) {
      funding = fundings.find((f) => f.id === fundingId);
    } else if (wishItemId) {
      // Create new PENDING funding
      funding = {
        id: `funding-${Date.now()}`,
        wishItemId,
        product: products[0],
        organizerId: currentUser.id,
        organizer: {
          id: currentUser.id,
          nickname: currentUser.nickname,
          avatarUrl: currentUser.avatarUrl,
        },
        recipientId: members[1].id,
        recipient: {
          id: members[1].id,
          nickname: members[1].nickname,
          avatarUrl: members[1].avatarUrl,
        },
        targetAmount: products[0].price,
        currentAmount: 0,
        status: 'PENDING',
        participantCount: 0,
        expiresAt: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000
        ).toISOString(),
        createdAt: new Date().toISOString(),
      };
      isNewFunding = true;
    }

    if (!funding) {
      return new HttpResponse(null, { status: 404 });
    }

    const newCartItem: CartItem = {
      id: `cart-item-${Date.now()}`,
      cartId: 'cart-1',
      fundingId: funding.id,
      funding,
      amount,
      selected: true,
      isNewFunding,
      createdAt: new Date().toISOString(),
    };

    cartItems.push(newCartItem);
    return HttpResponse.json(newCartItem, { status: 201 });
  }),

  http.patch('**/api/v2/cart/items/:itemId', async ({ params, request }) => {
    const { itemId } = params;
    const body = await request.json();
    const { amount, selected } = body as {
      amount?: number;
      selected?: boolean;
    };

    const item = cartItems.find((i) => i.id === itemId);
    if (!item) {
      return new HttpResponse(null, { status: 404 });
    }

    if (amount !== undefined) item.amount = amount;
    if (selected !== undefined) item.selected = selected;

    return HttpResponse.json(item);
  }),

  http.delete('**/api/v2/cart/items/:itemId', ({ params }) => {
    const { itemId } = params;
    cartItems = cartItems.filter((i) => i.id !== itemId);
    return new HttpResponse(null, { status: 204 });
  }),

  http.delete('**/api/v2/cart/clear', () => {
    cartItems = [];
    return new HttpResponse(null, { status: 204 });
  }),

  // ============================================
  // ORDERS
  // ============================================
  http.get('**/api/v2/orders', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');

    const mockOrders = [
      {
        orderId: 1001,
        orderNumber: 'ORD-20260223-001',
        quantity: 2,
        totalAmount: { amount: 50000 },
        status: 'PAID',
        paymentMethod: 'DEPOSIT',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 60000).toISOString(),
        confirmedAt: null,
        cancelledAt: null,
      },
      {
        orderId: 1002,
        orderNumber: 'ORD-20260222-002',
        quantity: 1,
        totalAmount: { amount: 35000 },
        status: 'CONFIRMED',
        paymentMethod: 'KAKAO_PAY',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 60000).toISOString(),
        confirmedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        cancelledAt: null,
      },
      {
        orderId: 1003,
        orderNumber: 'ORD-20260220-003',
        quantity: 3,
        totalAmount: { amount: 120000 },
        status: 'CANCELED',
        paymentMethod: 'CARD',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 60000).toISOString(),
        confirmedAt: null,
        cancelledAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        orderId: 1004,
        orderNumber: 'ORD-20260218-004',
        quantity: 1,
        totalAmount: { amount: 25000 },
        status: 'PARTIAL_CANCELED',
        paymentMethod: 'DEPOSIT',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        paidAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 60000).toISOString(),
        confirmedAt: null,
        cancelledAt: null,
      },
    ];

    const start = page * size;
    const end = start + size;
    const paginated = mockOrders.slice(start, end);

    return HttpResponse.json({
      orders: paginated,
      page,
      size,
      totalElements: mockOrders.length,
      totalPages: Math.ceil(mockOrders.length / size),
      hasNext: end < mockOrders.length,
      hasPrevious: page > 0,
    });
  }),

  http.get('**/api/v2/orders/:orderId', ({ params }) => {
    const { orderId } = params;

    const orderMap: Record<string, object> = {
      '1001': {
        orderDetail: {
          order: {
            orderId: 1001,
            orderNumber: 'ORD-20260223-001',
            quantity: 2,
            totalAmount: { amount: 50000 },
            status: 'PAID',
            paymentMethod: 'DEPOSIT',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 60000).toISOString(),
            confirmedAt: null,
            cancelledAt: null,
          },
          items: [
            {
              orderItemId: 2001,
              targetId: 100,
              orderItemType: 'FUNDING_GIFT',
              sellerId: 10,
              receiverId: 20,
              price: { amount: 30000 },
              amount: { amount: 30000 },
              status: 'PAID',
              cancelledAt: null,
            },
            {
              orderItemId: 2002,
              targetId: 101,
              orderItemType: 'NORMAL_GIFT',
              sellerId: 10,
              receiverId: 30,
              price: { amount: 20000 },
              amount: { amount: 20000 },
              status: 'PAID',
              cancelledAt: null,
            },
          ],
        },
      },
      '1002': {
        orderDetail: {
          order: {
            orderId: 1002,
            orderNumber: 'ORD-20260222-002',
            quantity: 1,
            totalAmount: { amount: 35000 },
            status: 'CONFIRMED',
            paymentMethod: 'KAKAO_PAY',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 60000).toISOString(),
            confirmedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            cancelledAt: null,
          },
          items: [
            {
              orderItemId: 2003,
              targetId: 102,
              orderItemType: 'FUNDING_GIFT',
              sellerId: 10,
              receiverId: 40,
              price: { amount: 35000 },
              amount: { amount: 35000 },
              status: 'CONFIRMED',
              cancelledAt: null,
            },
          ],
        },
      },
      '1003': {
        orderDetail: {
          order: {
            orderId: 1003,
            orderNumber: 'ORD-20260220-003',
            quantity: 3,
            totalAmount: { amount: 120000 },
            status: 'CANCELED',
            paymentMethod: 'CARD',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 60000).toISOString(),
            confirmedAt: null,
            cancelledAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          },
          items: [
            {
              orderItemId: 2004,
              targetId: 103,
              orderItemType: 'NORMAL_ORDER',
              sellerId: 10,
              receiverId: 50,
              price: { amount: 40000 },
              amount: { amount: 40000 },
              status: 'CANCELED',
              cancelledAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              orderItemId: 2005,
              targetId: 104,
              orderItemType: 'FUNDING_GIFT',
              sellerId: 10,
              receiverId: 60,
              price: { amount: 50000 },
              amount: { amount: 50000 },
              status: 'CANCELED',
              cancelledAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              orderItemId: 2006,
              targetId: 105,
              orderItemType: 'NORMAL_GIFT',
              sellerId: 10,
              receiverId: 70,
              price: { amount: 30000 },
              amount: { amount: 30000 },
              status: 'CANCELED',
              cancelledAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            },
          ],
        },
      },
      '1004': {
        orderDetail: {
          order: {
            orderId: 1004,
            orderNumber: 'ORD-20260218-004',
            quantity: 1,
            totalAmount: { amount: 25000 },
            status: 'PARTIAL_CANCELED',
            paymentMethod: 'DEPOSIT',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            paidAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 60000).toISOString(),
            confirmedAt: null,
            cancelledAt: null,
          },
          items: [
            {
              orderItemId: 2007,
              targetId: 106,
              orderItemType: 'FUNDING_GIFT',
              sellerId: 10,
              receiverId: 80,
              price: { amount: 25000 },
              amount: { amount: 25000 },
              status: 'CANCELED',
              cancelledAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            },
          ],
        },
      },
    };

    const detail = orderMap[orderId as string];
    if (!detail) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(detail);
  }),

];
