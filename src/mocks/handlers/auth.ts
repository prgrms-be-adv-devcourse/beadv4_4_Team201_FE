import { http, HttpResponse, passthrough, HttpHandler } from 'msw';
import { currentUser } from '../data/members';

export const authHandlers: HttpHandler[] = [
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

  http.all('**/api/v2/payments/**', () => passthrough()),
  http.all('**/api/auth/**', () => passthrough()),
];
