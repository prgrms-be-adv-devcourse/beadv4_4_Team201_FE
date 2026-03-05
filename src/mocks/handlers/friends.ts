import { http, HttpResponse, HttpHandler } from 'msw';
import { members } from '../data/members';
import { mockFriends, mockSentRequests, mockReceivedRequests, setMockFriends, setMockSentRequests, MockFriend, MockFriendRequest } from '../data/mock-data';

export const friendsHandlers: HttpHandler[] = [
  http.get('**/api/v2/friends', () => {
    return HttpResponse.json(mockFriends);
  }),

  http.get('**/api/v2/friends/requests', () => {
    return HttpResponse.json(mockReceivedRequests);
  }),

  http.get('**/api/v2/friends/requests/sent', () => {
    return HttpResponse.json(mockSentRequests);
  }),

  http.post('**/api/v2/friends/request', async ({ request }) => {
    const body = await request.json();
    const { receiverId } = body as { receiverId: number };

    const receiver = members.find(m => {
      const id = parseInt(m.id.replace('member-', '').replace('dev', '0'), 10);
      return id === receiverId;
    });

    if (!receiver) {
      return new HttpResponse(null, { status: 404 });
    }

    const friendshipId = Date.now();
    const newRequest: MockFriendRequest = {
      friendshipId,
      requester: {
        id: receiverId,
        nickname: receiver.nickname || 'Unknown',
        avatarUrl: receiver.avatarUrl || '',
      },
      createdAt: new Date().toISOString(),
    };

    const updatedSentRequests = [...mockSentRequests, newRequest];
    setMockSentRequests(updatedSentRequests);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mockSentRequests', JSON.stringify(updatedSentRequests));
    }

    return HttpResponse.json({
      id: friendshipId,
      requesterId: 0,
      receiverId,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      acceptedAt: null,
    });
  }),

  http.delete('**/api/v2/friends/:friendshipId', ({ params }) => {
    const { friendshipId } = params;
    const idNum = parseInt(friendshipId as string, 10);
    const updatedFriends = mockFriends.filter((f: MockFriend) => f.friendshipId !== idNum);
    const updatedSentRequests = mockSentRequests.filter((r: MockFriendRequest) => r.friendshipId !== idNum);

    setMockFriends(updatedFriends);
    setMockSentRequests(updatedSentRequests);

    if (typeof window !== 'undefined') {
      localStorage.setItem('mockFriends', JSON.stringify(updatedFriends));
      localStorage.setItem('mockSentRequests', JSON.stringify(updatedSentRequests));
    }
    return new HttpResponse(null, { status: 204 });
  }),
];
