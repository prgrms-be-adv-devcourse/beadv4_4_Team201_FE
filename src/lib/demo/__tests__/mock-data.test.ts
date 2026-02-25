import { describe, test, expect } from 'vitest';
import { getMockResponse } from '../mock-data';

describe('getMockResponse', () => {
  test('returns null for unregistered endpoint', () => {
    const result = getMockResponse('GET', 'api/v99/unknown');

    expect(result).toBeNull();
  });

  test('returns mock response for GET product list', () => {
    const result = getMockResponse('GET', 'api/v2/products/search/es');

    expect(result).not.toBeNull();
    expect(result!.status).toBe(200);
    expect(result!.body).toHaveProperty('result', 'SUCCESS');
    expect(result!.body.data.content).toBeInstanceOf(Array);
    expect(result!.body.data.content.length).toBeGreaterThan(0);
  });

  test('product items contain demo imageKey', () => {
    const result = getMockResponse('GET', 'api/v2/products/search/es');
    const product = result!.body.data.content[0];

    expect(product.imageKey).toBeTruthy();
    expect(product.imageKey).toMatch(/^demo\//);
  });

  test('returns mock for GET /api/v2/members/me', () => {
    const result = getMockResponse('GET', 'api/v2/members/me');

    expect(result).not.toBeNull();
    expect(result!.body.data).toHaveProperty('nickname');
    expect(result!.body.data).toHaveProperty('email');
  });

  test('returns mock for GET /api/v2/wallet/balance', () => {
    const result = getMockResponse('GET', 'api/v2/wallet/balance');

    expect(result).not.toBeNull();
    expect(result!.body.data).toHaveProperty('balance');
    expect(typeof result!.body.data.balance).toBe('number');
  });

  test('returns mock for GET /api/v2/carts', () => {
    const result = getMockResponse('GET', 'api/v2/carts');

    expect(result).not.toBeNull();
    expect(result!.body.data).toHaveProperty('items');
    expect(result!.body.data.items).toBeInstanceOf(Array);
  });

  test('matches parameterized path /api/v2/products/:id', () => {
    const result = getMockResponse('GET', 'api/v2/products/42');

    expect(result).not.toBeNull();
    expect(result!.body.data).toHaveProperty('name');
    expect(result!.body.data).toHaveProperty('imageKey');
  });

  test('distinguishes HTTP methods', () => {
    const getResult = getMockResponse('GET', 'api/v2/carts');
    const postResult = getMockResponse('POST', 'api/v2/carts');

    expect(getResult).not.toBeNull();
    expect(postResult).not.toBeNull();
    // POST returns success acknowledgement, not cart data
    expect(postResult!.status).toBe(200);
  });

  test('handles query string in path by ignoring it', () => {
    const result = getMockResponse('GET', 'api/v2/products/search/es?category=ELECTRONICS&page=0');

    expect(result).not.toBeNull();
    expect(result!.body.data.content).toBeInstanceOf(Array);
  });
});
