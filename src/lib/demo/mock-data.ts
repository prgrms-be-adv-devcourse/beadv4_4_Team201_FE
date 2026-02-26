interface MockResponse {
  status: number;
  body: { result: string; data: any };
}

interface RouteHandler {
  method: string;
  pattern: RegExp;
  handler: (params: Record<string, string>) => MockResponse;
}

function ok(data: unknown): MockResponse {
  return { status: 200, body: { result: 'SUCCESS', data } };
}

// --- Demo image keys per category ---
const CATEGORY_IMAGES: Record<string, string> = {
  ELECTRONICS: 'demo/electronics.jpg',
  BEAUTY: 'demo/beauty.jpg',
  FASHION: 'demo/fashion.jpg',
  LIVING: 'demo/living.jpg',
  FOODS: 'demo/foods.jpg',
  TOYS: 'demo/toys.jpg',
  OUTDOOR: 'demo/outdoor.jpg',
  PET: 'demo/pet.jpg',
  KITCHEN: 'demo/kitchen.jpg',
};

const CATEGORIES = Object.keys(CATEGORY_IMAGES);

function demoProduct(id: number, category: string) {
  return {
    id,
    sellerNickName: '데모 셀러',
    name: `${category} 샘플 상품 ${id}`,
    description: `${category} 카테고리의 데모 상품입니다.`,
    price: 10000 + id * 5000,
    category,
    imageKey: CATEGORY_IMAGES[category] || 'demo/default.jpg',
    isSoldout: false,
    isActive: true,
    createdAt: '2026-02-01T00:00:00',
  };
}

function demoProducts() {
  const products: ReturnType<typeof demoProduct>[] = [];
  let id = 1;
  for (const cat of CATEGORIES) {
    for (let i = 0; i < 3; i++) {
      products.push(demoProduct(id++, cat));
    }
  }
  return products;
}

// --- Route handlers ---

const routes: RouteHandler[] = [
  // Products
  {
    method: 'GET',
    pattern: /^api\/v2\/products\/search\/es/,
    handler: () => {
      const content = demoProducts();
      return ok({
        content,
        pageNumber: 0,
        pageSize: 20,
        totalElements: content.length,
        totalPages: 1,
        isFirst: true,
        isLast: true,
      });
    },
  },
  {
    method: 'GET',
    pattern: /^api\/v2\/products\/(\d+)$/,
    handler: ({ id }) => ok(demoProduct(Number(id), 'ELECTRONICS')),
  },

  // Members
  {
    method: 'GET',
    pattern: /^api\/v2\/members\/me$/,
    handler: () =>
      ok({
        id: 1,
        authSub: 'auth0|demo',
        nickname: '데모 사용자',
        email: 'demo@giftify.app',
        name: '홍길동',
        avatarUrl: null,
        role: 'BUYER',
        status: 'ACTIVE',
      }),
  },
  {
    method: 'PATCH',
    pattern: /^api\/v2\/members\/me$/,
    handler: () =>
      ok({
        id: 1,
        authSub: 'auth0|demo',
        nickname: '데모 사용자',
        email: 'demo@giftify.app',
        name: '홍길동',
        avatarUrl: null,
        role: 'BUYER',
        status: 'ACTIVE',
      }),
  },
  {
    method: 'GET',
    pattern: /^api\/v2\/members\/check-registration$/,
    handler: () => ok({ registered: true, member: { id: 1, nickname: '데모 사용자' } }),
  },

  // Wallet
  {
    method: 'GET',
    pattern: /^api\/v2\/wallet\/balance$/,
    handler: () => ok({ walletId: 1, balance: 150000 }),
  },
  {
    method: 'GET',
    pattern: /^api\/v2\/wallet\/history/,
    handler: () =>
      ok({
        content: [
          {
            id: 1,
            type: 'CHARGE',
            amount: 100000,
            balanceAfter: 150000,
            description: '충전',
            relatedId: null,
            createdAt: '2026-02-20T10:00:00',
          },
        ],
        pageable: { pageNumber: 0, pageSize: 10 },
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 10,
        first: true,
        last: true,
      }),
  },

  // Cart (BackendCartResponse format)
  {
    method: 'GET',
    pattern: /^api\/v2\/carts$/,
    handler: () =>
      ok({
        cartId: 1,
        memberId: 1,
        items: [
          {
            targetType: 'FUNDING',
            targetId: 101,
            receiverId: 2,
            receiverNickname: '친구1',
            productName: 'ELECTRONICS 샘플 상품 1',
            imageKey: 'demo/electronics.jpg',
            productPrice: 50000,
            contributionAmount: 10000,
            status: 'AVAILABLE',
            statusMessage: null,
          },
          {
            targetType: 'FUNDING_PENDING',
            targetId: 2,
            receiverId: 3,
            receiverNickname: '친구2',
            productName: 'BEAUTY 샘플 상품 4',
            imageKey: 'demo/beauty.jpg',
            productPrice: 30000,
            contributionAmount: 30000,
            status: 'AVAILABLE',
            statusMessage: null,
          },
        ],
        totalAmount: 40000,
      }),
  },
  {
    method: 'POST',
    pattern: /^api\/v2\/carts$/,
    handler: () => ok(null),
  },
  {
    method: 'PATCH',
    pattern: /^api\/v2\/carts\/items$/,
    handler: () => ok(null),
  },
  {
    method: 'DELETE',
    pattern: /^api\/v2\/carts$/,
    handler: () => ok(null),
  },

  // Orders
  {
    method: 'POST',
    pattern: /^api\/v2\/orders$/,
    handler: () => ok({ orderId: 1001 }),
  },
  {
    method: 'GET',
    pattern: /^api\/v2\/orders$/,
    handler: () =>
      ok({
        orders: [
          {
            orderId: 1001,
            orderNumber: 'ORD-20260225-001',
            quantity: 1,
            totalAmount: { amount: 10000 },
            status: 'PAID',
            paymentMethod: 'DEPOSIT',
            createdAt: '2026-02-25T10:00:00',
            paidAt: '2026-02-25T10:00:01',
            confirmedAt: null,
            cancelledAt: null,
          },
        ],
        page: 0,
        size: 10,
        totalElements: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      }),
  },
  {
    method: 'GET',
    pattern: /^api\/v2\/orders\/(\d+)$/,
    handler: () =>
      ok({
        orderDetail: {
          order: {
            orderId: 1001,
            orderNumber: 'ORD-20260225-001',
            quantity: 1,
            totalAmount: { amount: 10000 },
            status: 'PAID',
            paymentMethod: 'DEPOSIT',
            createdAt: '2026-02-25T10:00:00',
            paidAt: '2026-02-25T10:00:01',
            confirmedAt: null,
            cancelledAt: null,
          },
          items: [
            {
              orderItemId: 1,
              targetId: 101,
              orderItemType: 'FUNDING_GIFT',
              sellerId: 10,
              receiverId: 2,
              price: { amount: 50000 },
              amount: { amount: 10000 },
              status: 'PAID',
              cancelledAt: null,
            },
          ],
        },
      }),
  },

  // Fundings
  {
    method: 'GET',
    pattern: /^api\/v2\/fundings\/list/,
    handler: () => {
      const fundings = [
        {
          fundingId: 101,
          targetAmount: 50000,
          currentAmount: 20000,
          status: 'IN_PROGRESS',
          deadline: '2026-03-15T00:00:00',
          wishlistItemId: 1,
          productId: 1,
          productName: 'ELECTRONICS 샘플 상품 1',
          imageKey: 'demo/electronics.jpg',
          achievementRate: 40,
          daysRemaining: 18,
          receiverNickname: '친구1',
        },
        {
          fundingId: 102,
          targetAmount: 30000,
          currentAmount: 30000,
          status: 'ACHIEVED',
          deadline: '2026-03-10T00:00:00',
          wishlistItemId: 2,
          productId: 4,
          productName: 'BEAUTY 샘플 상품 4',
          imageKey: 'demo/beauty.jpg',
          achievementRate: 100,
          daysRemaining: 0,
          receiverNickname: '친구2',
        },
      ];
      return ok({
        content: fundings,
        pageNumber: 0,
        pageSize: 10,
        totalElements: fundings.length,
        totalPages: 1,
        isFirst: true,
        isLast: true,
      });
    },
  },
  {
    method: 'GET',
    pattern: /^api\/v2\/fundings\/my\/list/,
    handler: () =>
      ok({
        content: [],
        pageNumber: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
        isFirst: true,
        isLast: true,
      }),
  },
  {
    method: 'GET',
    pattern: /^api\/v2\/fundings\/participated\/list/,
    handler: () =>
      ok({
        content: [
          {
            fundingId: 101,
            targetAmount: 50000,
            currentAmount: 20000,
            status: 'IN_PROGRESS',
            deadline: '2026-03-15T00:00:00',
            wishlistItemId: 1,
            productId: 1,
            productName: 'ELECTRONICS 샘플 상품 1',
            imageKey: 'demo/electronics.jpg',
            achievementRate: 40,
            daysRemaining: 18,
            receiverNickname: '친구1',
            myContribution: 10000,
          },
        ],
        pageNumber: 0,
        pageSize: 10,
        totalElements: 1,
        totalPages: 1,
        isFirst: true,
        isLast: true,
      }),
  },
  {
    method: 'GET',
    pattern: /^api\/v2\/fundings\/friends\/list/,
    handler: () =>
      ok({
        content: [],
        pageNumber: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
        isFirst: true,
        isLast: true,
      }),
  },
  {
    method: 'GET',
    pattern: /^api\/v2\/fundings\/(\d+)$/,
    handler: () =>
      ok({
        fundingId: 101,
        targetAmount: 50000,
        currentAmount: 20000,
        status: 'IN_PROGRESS',
        deadline: '2026-03-15T00:00:00',
        wishlistItemId: 1,
        productId: 1,
        productName: 'ELECTRONICS 샘플 상품 1',
        imageKey: 'demo/electronics.jpg',
        achievementRate: 40,
        daysRemaining: 18,
        receiverNickname: '친구1',
      }),
  },

  // Friends
  {
    method: 'GET',
    pattern: /^api\/v2\/friends$/,
    handler: () =>
      ok([
        { id: 2, friendshipId: 1, nickname: '친구1', avatarUrl: null },
        { id: 3, friendshipId: 2, nickname: '친구2', avatarUrl: null },
      ]),
  },
  {
    method: 'GET',
    pattern: /^api\/v2\/friends\/requests$/,
    handler: () => ok([]),
  },
  {
    method: 'GET',
    pattern: /^api\/v2\/friends\/requests\/sent$/,
    handler: () => ok([]),
  },

  // Wishlists
  {
    method: 'GET',
    pattern: /^api\/v2\/wishlists\/me/,
    handler: () =>
      ok({
        id: 1,
        memberId: 1,
        nickname: '데모 사용자',
        visibility: 'PUBLIC',
        items: {
          content: [
            {
              wishlistItemId: 1,
              productId: 1,
              productName: 'ELECTRONICS 샘플 상품 1',
              price: 15000,
              imageKey: 'demo/electronics.jpg',
              sellerNickname: '데모 셀러',
              category: 'ELECTRONICS',
              status: 'IN_PROGRESS',
              fundingId: 101,
              addedAt: '2026-02-01T00:00:00',
            },
            {
              wishlistItemId: 2,
              productId: 4,
              productName: 'BEAUTY 샘플 상품 4',
              price: 30000,
              imageKey: 'demo/beauty.jpg',
              sellerNickname: '데모 셀러',
              category: 'BEAUTY',
              status: 'PENDING',
              fundingId: null,
              addedAt: '2026-02-05T00:00:00',
            },
          ],
          pageNumber: 0,
          pageSize: 10,
          totalElements: 2,
          totalPages: 1,
          isFirst: true,
          isLast: true,
        },
        itemCount: 2,
      }),
  },
  {
    method: 'PATCH',
    pattern: /^api\/v2\/wishlists\/me\/settings$/,
    handler: () => ok({ visibility: 'PUBLIC' }),
  },

  // Notifications
  {
    method: 'GET',
    pattern: /^api\/v1\/notifications\/unread\/count$/,
    handler: () => ok({ count: 2 }),
  },
  {
    method: 'GET',
    pattern: /^api\/v1\/notifications/,
    handler: () =>
      ok({
        content: [
          {
            id: 1,
            type: 'FUNDING_CREATED',
            title: '새 펀딩이 생성되었습니다',
            content: '친구1님이 ELECTRONICS 샘플 상품 1 펀딩을 시작했습니다.',
            isRead: false,
            readAt: null,
            referenceId: '101',
            referenceType: 'FUNDING',
            createdAt: '2026-02-25T09:00:00',
          },
          {
            id: 2,
            type: 'FRIEND_REQUEST_ACCEPTED',
            title: '친구 요청이 수락되었습니다',
            content: '친구2님이 친구 요청을 수락했습니다.',
            isRead: true,
            readAt: '2026-02-24T15:00:00',
            referenceId: '2',
            referenceType: 'FRIENDSHIP',
            createdAt: '2026-02-24T14:00:00',
          },
        ],
        pageable: { pageNumber: 0, pageSize: 20 },
        totalElements: 2,
        totalPages: 1,
        number: 0,
        size: 20,
        first: true,
        last: true,
      }),
  },
  {
    method: 'PATCH',
    pattern: /^api\/v1\/notifications\/read-all$/,
    handler: () => ok(null),
  },
  {
    method: 'PATCH',
    pattern: /^api\/v1\/notifications\/(\d+)\/read$/,
    handler: () => ok(null),
  },

  // Payment
  {
    method: 'POST',
    pattern: /^api\/v2\/payments\/confirm$/,
    handler: () => ok({ orderId: 1001, status: 'PAID' }),
  },
  {
    method: 'POST',
    pattern: /^api\/v2\/payments\/charge$/,
    handler: () =>
      ok({
        chargeId: 'charge-demo-001',
        paymentUrl: 'https://demo.tosspayments.com/charge',
        amount: 50000,
      }),
  },

  // Seller products
  {
    method: 'GET',
    pattern: /^api\/v2\/products\/my/,
    handler: () =>
      ok({
        content: [demoProduct(1, 'ELECTRONICS')],
        pageNumber: 0,
        pageSize: 10,
        totalElements: 1,
        totalPages: 1,
        isFirst: true,
        isLast: true,
      }),
  },
  {
    method: 'POST',
    pattern: /^api\/v2\/products$/,
    handler: () => ok(demoProduct(99, 'ELECTRONICS')),
  },

  // Auth
  {
    method: 'POST',
    pattern: /^api\/v2\/auth\/login$/,
    handler: () =>
      ok({
        isNewUser: false,
        authSub: 'auth0|demo',
        email: 'demo@giftify.app',
        name: '홍길동',
        member: {
          id: 1,
          nickname: '데모 사용자',
          email: 'demo@giftify.app',
          role: 'BUYER',
          status: 'ACTIVE',
        },
      }),
  },

  // Wishlist search
  {
    method: 'GET',
    pattern: /^api\/v2\/wishlists\/search/,
    handler: () => ok([{ memberId: 2, nickname: '친구1' }]),
  },
  {
    method: 'GET',
    pattern: /^api\/v2\/wishlists\/(\d+)$/,
    handler: () =>
      ok({
        memberId: 2,
        nickname: '친구1',
        items: [
          {
            wishlistItemId: 10,
            productId: 1,
            productName: 'ELECTRONICS 샘플 상품 1',
            price: 15000,
            addedAt: '2026-02-01T00:00:00',
          },
        ],
      }),
  },

  // Friends wishlists
  {
    method: 'GET',
    pattern: /^api\/v2\/friends\/wishlists/,
    handler: () => ok([]),
  },

  // Wallet withdraw
  {
    method: 'POST',
    pattern: /^api\/v2\/wallet\/withdraw$/,
    handler: () =>
      ok({
        walletId: 1,
        balance: 100000,
        withdrawnAmount: 50000,
        transactionId: 'txn-demo-001',
        status: 'COMPLETED',
      }),
  },
];

export function getMockResponse(method: string, path: string): MockResponse | null {
  // Strip query string for matching
  const cleanPath = path.split('?')[0];

  for (const route of routes) {
    if (route.method !== method) continue;

    const match = cleanPath.match(route.pattern);
    if (match) {
      const params: Record<string, string> = {};
      if (match[1]) params.id = match[1];
      return route.handler(params);
    }
  }

  return null;
}
