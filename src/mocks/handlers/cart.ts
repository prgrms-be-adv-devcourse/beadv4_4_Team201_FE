import { http, HttpResponse, HttpHandler } from 'msw';
import { cartItems, setCartItems, CartItem } from '../data/mock-data';
import { fundings } from '../data/fundings';
import { products } from '../data/products';
import { currentUser, members } from '../data/members';
import { Funding } from '@/types/funding';

export const cartHandlers: HttpHandler[] = [
  http.get('**/api/v2/carts', () => {
    const totalAmount = cartItems
      .filter((item) => item.selected)
      .reduce((sum, item) => sum + item.amount, 0);

    return HttpResponse.json({
      result: 'SUCCESS',
      data: {
        cartId: 1,
        memberId: 1,
        items: cartItems.map(item => ({
          targetType: item.targetType,
          targetId: item.targetId,
          receiverId: item.funding.recipientId ? parseInt(item.funding.recipientId.replace('member-', '').replace('user-', ''), 10) : 1,
          receiverNickname: item.funding.recipient.nickname || '테스터',
          productId: item.productId,
          productName: item.funding.product.name,
          imageKey: 'mock-key',
          productPrice: item.funding.product.price,
          contributionAmount: item.amount,
          currentAmount: item.funding.currentAmount || 0,
          fundingId: item.fundingId ? parseInt(item.fundingId.replace('funding-', ''), 10) : null,
          status: 'AVAILABLE',
          statusMessage: null
        })),
        totalAmount,
      },
      message: null,
      errorCode: null,
    });
  }),

  http.post('**/api/v2/carts', async ({ request }) => {
    const body = await request.json();
    const { targetId, amount } = body as {
      targetId: number;
      amount: number;
    };

    let funding = fundings.find((f) => f.id === `funding-${targetId}`);
    const targetType = funding ? 'FUNDING' : 'FUNDING_PENDING';

    // Check if already in cart
    const existingItem = (cartItems || []).find(
      (item) => item.targetType === targetType && parseInt(String(item.targetId), 10) === targetId
    );

    if (existingItem) {
      existingItem.amount = amount;
      return HttpResponse.json({
        result: 'SUCCESS',
        data: null,
        message: '이미 장바구니에 있는 상품의 가격이 수정되었습니다.',
        errorCode: null,
      });
    }

    let isNewFunding = false;

    if (!funding) {
      funding = {
        id: `funding-${Date.now()}`,
        wishItemId: `wish-item-${targetId}`,
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
      targetType,
      targetId,
      productId: parseInt(funding.product.id.replace('product-', ''), 10) || 1,
      fundingId: funding.id,
      funding,
      amount,
      selected: true,
      isNewFunding,
      createdAt: new Date().toISOString(),
    };

    const updatedCartItems = [...cartItems, newCartItem];
    setCartItems(updatedCartItems);
    return HttpResponse.json(
      {
        result: 'SUCCESS',
        data: newCartItem,
        message: '장바구니에 상품을 추가했습니다.',
        errorCode: null,
      },
      { status: 201 }
    );
  }),

  http.patch('**/api/v2/carts/items', async ({ request }) => {
    const body = await request.json();
    const updates = body as { targetType: string; targetId: number; amount: number }[];

    updates.forEach(update => {
      const item = cartItems.find(
        i => i.targetType === update.targetType && i.targetId === update.targetId
      );
      if (item) {
        item.amount = update.amount;
      }
    });

    return new HttpResponse(null, { status: 204 });
  }),

  http.delete('**/api/v2/carts/items/:targetType', ({ params, request }) => {
    const { targetType } = params;
    const url = new URL(request.url);
    const targetIdsStr = url.searchParams.get('targetIds');

    if (targetIdsStr) {
      const targetIds = targetIdsStr.split(',').map(id => parseInt(id, 10));
      const updatedCartItems = cartItems.filter(
        i => !(i.targetType === targetType && targetIds.includes(i.targetId))
      );
      setCartItems(updatedCartItems);
    }

    return new HttpResponse(null, { status: 204 });
  }),

  http.delete('**/api/v2/carts', () => {
    setCartItems([]);
    return new HttpResponse(null, { status: 204 });
  }),
];
