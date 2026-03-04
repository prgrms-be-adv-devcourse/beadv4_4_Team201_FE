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
      cartId: 1,
      memberId: 1,
      items: cartItems.map(item => ({
        targetType: item.targetType,
        targetId: item.targetId,
        receiverId: 1,
        receiverNickname: '테스터',
        productId: item.productId,
        productName: item.funding.product.name,
        imageKey: 'mock-key',
        productPrice: item.funding.product.price,
        contributionAmount: item.amount,
        currentAmount: 0,
        fundingId: item.fundingId ? parseInt(item.fundingId.replace('funding-', ''), 10) : null,
        status: 'AVAILABLE',
        statusMessage: null
      })),
      totalAmount,
    });
  }),

  http.post('**/api/v2/carts', async ({ request }) => {
    const body = await request.json();
    const { targetType, targetId, amount } = body as {
      targetType: 'FUNDING' | 'FUNDING_PENDING';
      targetId: number;
      amount: number;
    };

    let funding: Funding | undefined;
    let isNewFunding = false;

    if (targetType === 'FUNDING') {
      funding = fundings.find((f) => f.id === `funding-${targetId}`);
    } else {
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
    const updatedCartItems = cartItems.filter((i) => i.id !== itemId);
    setCartItems(updatedCartItems);
    return new HttpResponse(null, { status: 204 });
  }),

  http.delete('**/api/v2/cart/clear', () => {
    setCartItems([]);
    return new HttpResponse(null, { status: 204 });
  }),
];
