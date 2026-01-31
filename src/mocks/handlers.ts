import { http, HttpResponse, passthrough } from 'msw';
import {
  currentUser,
  members,
  friends,
  type Member,
  type MemberPublic,
} from './data/members';
import {
  products,
  productDetails,
  popularProducts,
  type Product,
  type ProductDetail,
} from './data/products';
import {
  fundings,
  fundingParticipants,
  myOrganizedFundings,
  myParticipatedFundings,
  myReceivedFundings,
  type Funding,
  type FundingParticipant,
} from './data/fundings';
import {
  myWishlist,
  friendsWishlists,
  wishlists,
  type Wishlist,
} from './data/wishlists';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Mock wallet data
let walletBalance = 1000000;

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
  // AUTH (BFF & Backend)
  // ============================================
  // Mock the BFF sync route
  http.post('*/api/auth/sync', ({ request }) => {
    // Dynamically check if new user (for testing: email containing 'new')
    const isNewUser = !currentUser.nickname || currentUser.email.includes('new');
    return HttpResponse.json({
      member: currentUser.nickname ? currentUser : null,
      isNewUser,
    });
  }),
  // BFF sync route still mocked or passthrough? 
  // User says: /api/v2/auth/login and /api/v2/members/me should be passthrough.

  http.post('*/api/v2/auth/login', () => passthrough()),

  http.post('*/api/v2/auth/logout', () => passthrough()),

  http.get('*/api/v2/auth/me', () => passthrough()),

  // ============================================
  // MEMBERS
  // ============================================
  http.get('*/api/v2/members/me', () => passthrough()),

  http.get('*/api/v2/members/:memberId', ({ params }) => {
    const { memberId } = params;
    const member = members.find((m) => m.id === memberId);
    if (!member) {
      return new HttpResponse(null, { status: 404 });
    }
    const publicMember: MemberPublic = {
      id: member.id,
      nickname: member.nickname,
      avatarUrl: member.avatarUrl,
    };
    return HttpResponse.json(publicMember);
  }),

  http.patch('*/api/v2/members/:memberId', async ({ params, request }) => {
    const { memberId } = params;
    const body = await request.json();

    // Update currentUser if it matches (for testing flow)
    if (currentUser.id === memberId) {
      Object.assign(currentUser, body);
    }

    const memberIndex = members.findIndex(m => m.id === memberId);
    if (memberIndex !== -1) {
      members[memberIndex] = { ...members[memberIndex], ...(body as object) };
      return HttpResponse.json(members[memberIndex]);
    }

    // Fallback if not found (shouldn't happen in test flow)
    return HttpResponse.json({
      id: memberId,
      ...(body as object)
    });
  }),

  http.get('*/api/v2/members/:memberId/friends', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');

    const start = page * size;
    const end = start + size;
    const paginatedFriends = friends.slice(start, end);

    return HttpResponse.json({
      items: paginatedFriends,
      page: {
        page,
        size,
        totalElements: friends.length,
        totalPages: Math.ceil(friends.length / size),
        hasNext: end < friends.length,
        hasPrevious: page > 0,
      },
    });
  }),

  // ============================================
  // WISHLISTS
  // ============================================
  http.get('*/api/v2/wishlists/me', () => {
    return HttpResponse.json(myWishlist);
  }),

  http.get('*/api/v2/wishlists/:memberId', ({ params }) => {
    const { memberId } = params;
    const wishlist = wishlists.find((w) => w.memberId === memberId);
    if (!wishlist) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(wishlist);
  }),

  http.patch('*/api/v2/wishlists/visibility', async ({ request }) => {
    const body = await request.json();
    const updatedWishlist = {
      ...myWishlist,
      visibility: (body as { visibility: string }).visibility,
    };
    return HttpResponse.json(updatedWishlist);
  }),

  http.post('*/api/v2/wishlists/items', async ({ request }) => {
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

  http.delete('*/api/v2/wishlists/items/:itemId', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('*/api/v2/friends/wishlists', ({ request }) => {
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
  http.get('*/api/v2/products', ({ request }) => {
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

  http.get('*/api/v2/products/search', ({ request }) => {
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

  http.get('*/api/v2/products/popular', ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '8');
    return HttpResponse.json({ items: popularProducts.slice(0, limit) });
  }),

  http.get('*/api/v2/products/:productId', ({ params }) => {
    const { productId } = params;
    const detail = productDetails[productId as string];
    if (!detail) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(detail);
  }),

  // ============================================
  // FUNDINGS
  // ============================================
  http.get('*/api/v2/fundings', ({ request }) => {
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

  http.post('*/api/v2/fundings', async ({ request }) => {
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

  http.get('*/api/v2/fundings/:fundingId', ({ params }) => {
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

  http.post('*/api/v2/fundings/:fundingId/accept', ({ params }) => {
    const { fundingId } = params;
    const funding = fundings.find((f) => f.id === fundingId);
    if (!funding) {
      return new HttpResponse(null, { status: 404 });
    }
    const updatedFunding = { ...funding, status: 'ACCEPTED' as const };
    return HttpResponse.json(updatedFunding);
  }),

  http.post('*/api/v2/fundings/:fundingId/refuse', ({ params }) => {
    const { fundingId } = params;
    const funding = fundings.find((f) => f.id === fundingId);
    if (!funding) {
      return new HttpResponse(null, { status: 404 });
    }
    const updatedFunding = { ...funding, status: 'REFUSED' as const };
    return HttpResponse.json(updatedFunding);
  }),

  http.get('*/api/v2/fundings/:fundingId/participants', ({ request, params }) => {
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

  http.get('*/api/v2/fundings/my/organized', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');

    let filtered = myOrganizedFundings;
    if (status) {
      filtered = myOrganizedFundings.filter((f) => f.status === status);
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

  http.get('*/api/v2/fundings/my/participated', ({ request }) => {
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

  http.get('*/api/v2/fundings/my/received', ({ request }) => {
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
  http.get('*/api/v2/cart', () => {
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

  http.post('*/api/v2/cart/items', async ({ request }) => {
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

  http.patch('*/api/v2/cart/items/:itemId', async ({ params, request }) => {
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

  http.delete('*/api/v2/cart/items/:itemId', ({ params }) => {
    const { itemId } = params;
    cartItems = cartItems.filter((i) => i.id !== itemId);
    return new HttpResponse(null, { status: 204 });
  }),

  http.delete('*/api/v2/cart/clear', () => {
    cartItems = [];
    return new HttpResponse(null, { status: 204 });
  }),

  // ============================================
  // WALLET
  // ============================================
  http.get('*/api/v2/wallet', () => {
    return HttpResponse.json({
      id: 'wallet-1',
      memberId: currentUser.id,
      balance: walletBalance,
    });
  }),

  http.post('*/api/v2/wallet/charge', async ({ request }) => {
    const body = await request.json();
    const { amount } = body as { amount: number };

    return HttpResponse.json({
      chargeId: `charge-${Date.now()}`,
      paymentUrl: 'https://mock-payment-url.com',
      amount,
    });
  }),

  http.get('*/api/v2/wallet/history', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');

    const mockHistory = [
      {
        id: 'tx-1',
        type: 'CHARGE',
        amount: 1000000,
        balanceAfter: walletBalance,
        description: '지갑 충전',
        relatedId: null,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const start = page * size;
    const end = start + size;
    const paginated = mockHistory.slice(start, end);

    return HttpResponse.json({
      items: paginated,
      page: {
        page,
        size,
        totalElements: mockHistory.length,
        totalPages: Math.ceil(mockHistory.length / size),
        hasNext: end < mockHistory.length,
        hasPrevious: page > 0,
      },
    });
  }),

  // ============================================
  // HOME
  // ============================================
  http.get('*/api/v2/home', () => {
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
];
