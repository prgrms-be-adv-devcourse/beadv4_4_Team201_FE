import { describe, test, expect, vi, beforeEach } from 'vitest';

describe('resolveImageUrl', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  test('returns placeholder for null imageKey', async () => {
    const { resolveImageUrl, PLACEHOLDER_IMAGE } = await import('../image');
    expect(resolveImageUrl(null)).toBe(PLACEHOLDER_IMAGE);
  });

  test('resolves demo/ prefix to static /images/demo/ path', async () => {
    vi.stubEnv('NEXT_PUBLIC_IMAGE_BASE_URL', 'http://localhost:9000/giftify');
    const { resolveImageUrl } = await import('../image');

    const result = resolveImageUrl('demo/electronics.jpg');

    expect(result).toBe('/images/demo/electronics.jpg');
  });

  test('resolves non-demo imageKey via IMAGE_BASE_URL', async () => {
    vi.stubEnv('NEXT_PUBLIC_IMAGE_BASE_URL', 'http://localhost:9000/giftify');
    const { resolveImageUrl } = await import('../image');

    const result = resolveImageUrl('products/img-001.jpg');

    expect(result).toBe('http://localhost:9000/giftify/products/img-001.jpg');
  });
});
