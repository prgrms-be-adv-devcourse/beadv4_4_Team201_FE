import { http, HttpResponse, HttpHandler } from 'msw';

export const ordersHandlers: HttpHandler[] = [
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
