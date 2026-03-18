import { http, HttpResponse, HttpHandler } from 'msw';
import { fundings, fundingParticipants, myParticipatedFundings, myReceivedFundings } from '../data/fundings';
import { products } from '../data/products';
import { currentUser, members } from '../data/members';
import { Funding } from '@/types/funding';

export const fundingsHandlers: HttpHandler[] = [
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
      fundingId: parseInt(funding.id.replace('funding-', ''), 10),
      targetAmount: funding.targetAmount,
      currentAmount: funding.currentAmount,
      status: funding.status,
      deadline: funding.expiresAt,
      wishlistItemId: parseInt(funding.wishItemId.replace('wish-item-', ''), 10),
      productId: parseInt(funding.product.id.replace('product-', ''), 10),
      productName: funding.product.name,
      productPrice: funding.product.price,
      imageKey: funding.product.imageUrl.split('/').pop(),
      achievementRate: Math.floor((funding.currentAmount / funding.targetAmount) * 100),
      daysRemaining: 14,
      participants: participants.slice(0, 5),
      myParticipation: myParticipation || null,
    });
  }),

  http.get('**/api/v2/fundings/my/:fundingId', ({ params }) => {
    const { fundingId } = params;
    // For simplicity, reuse getFunding data but only if user is organizer/recipient
    const funding = fundings.find((f) => f.id === `funding-${fundingId}` && f.organizerId === currentUser.id);
    if (!funding) return new HttpResponse(null, { status: 404 });

    return HttpResponse.json({
      fundingId: parseInt(fundingId as string, 10),
      wishlistItemId: parseInt(funding.wishItemId.replace('wish-item-', ''), 10),
      targetAmount: funding.targetAmount,
      currentAmount: funding.currentAmount,
      status: funding.status,
      deadline: funding.expiresAt,
      productName: funding.product.name,
      imageKey: funding.product.imageUrl.split('/').pop(),
      achievementRate: Math.floor((funding.currentAmount / funding.targetAmount) * 100),
      daysRemaining: 14,
      participants: [],
    });
  }),

  http.get('**/api/v2/fundings/participated/:fundingId', ({ params }) => {
    const { fundingId } = params;
    // Check if user has participation
    const participants = fundingParticipants[`funding-${fundingId}`] || [];
    const myP = participants.find(p => p.memberId === currentUser.id);

    if (!myP) return new HttpResponse(null, { status: 404 });

    const funding = fundings.find((f) => f.id === `funding-${fundingId}`);
    if (!funding) return new HttpResponse(null, { status: 404 });

    return HttpResponse.json({
      fundingId: parseInt(fundingId as string, 10),
      targetAmount: funding.targetAmount,
      currentAmount: funding.currentAmount,
      status: funding.status,
      deadline: funding.expiresAt,
      wishlistItemId: parseInt(funding.wishItemId.replace('wish-item-', ''), 10),
      productId: parseInt(funding.product.id.replace('product-', ''), 10),
      productName: funding.product.name,
      imageKey: funding.product.imageUrl.split('/').pop(),
      achievementRate: Math.floor((funding.currentAmount / funding.targetAmount) * 100),
      daysRemaining: 14,
      myContribution: myP.amount,
    });
  }),

  http.post('**/api/v2/fundings/:fundingId/accept', ({ params }) => {
    const { fundingId } = params;
    const funding = fundings.find((f) => f.id === fundingId);
    if (!funding) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({
      fundingId: parseInt(funding.id.replace('funding-', ''), 10),
      wishlistItemId: parseInt(funding.wishItemId.replace('wish-item-', ''), 10),
      productName: funding.product.name,
      status: 'ACCEPTED',
      closeAt: new Date().toISOString(),
    });
  }),

  http.post('**/api/v2/fundings/retryAccept/:fundingId', ({ params }) => {
    const { fundingId } = params;
    if (!fundingId) {
      return new HttpResponse(null, { status: 400 });
    }
    // fundingId might be a number or string like 'funding-123'
    const id = fundingId.toString().startsWith('funding-') ? fundingId : `funding-${fundingId}`;
    const funding = fundings.find((f) => f.id === id);
    if (!funding) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({
      fundingId: parseInt(funding.id.replace('funding-', ''), 10),
      wishlistItemId: parseInt(funding.wishItemId.replace('wish-item-', ''), 10),
      productName: funding.product.name,
      status: 'ACCEPTED',
      closeAt: new Date().toISOString(),
    });
  }),

  http.post('**/api/v2/fundings/:fundingId/refuse', ({ params }) => {
    const { fundingId } = params;
    const funding = fundings.find((f) => f.id === fundingId);
    if (!funding) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json({
      fundingId: parseInt(funding.id.replace('funding-', ''), 10),
      wishlistItemId: parseInt(funding.wishItemId.replace('wish-item-', ''), 10),
      productName: funding.product.name,
      status: 'REFUSED',
      closeAt: new Date().toISOString(),
    });
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
];
