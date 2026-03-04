import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { apiClient, ApiError } from '../client';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('API Client Error Handling', () => {
  describe('JSON error responses', () => {
    it('should handle JSON error with message and code', async () => {
      server.use(
        http.get('/api/proxy/test', () => {
          return HttpResponse.json(
            { message: '요청한 리소스를 찾을 수 없습니다', code: 'NOT_FOUND' },
            { status: 404 }
          );
        })
      );

      try {
        await apiClient.get('/test');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.message).toBe('요청한 리소스를 찾을 수 없습니다');
        expect(apiError.code).toBe('NOT_FOUND');
        expect(apiError.status).toBe(404);
      }
    });

    it('should handle JSON error with errorCode (RsData format)', async () => {
      server.use(
        http.get('/api/proxy/test', () => {
          return HttpResponse.json(
            { message: '서버 오류', errorCode: 'INTERNAL_ERROR' },
            { status: 500 }
          );
        })
      );

      try {
        await apiClient.get('/test');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.message).toBe('서버 오류');
        expect(apiError.code).toBe('INTERNAL_ERROR');
        expect(apiError.status).toBe(500);
      }
    });

    it('should handle JSON error with details', async () => {
      server.use(
        http.get('/api/proxy/test', () => {
          return HttpResponse.json(
            {
              message: '검증 실패',
              code: 'VALIDATION_ERROR',
              details: { field: 'email', reason: 'invalid format' }
            },
            { status: 400 }
          );
        })
      );

      try {
        await apiClient.get('/test');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.details).toEqual({ field: 'email', reason: 'invalid format' });
      }
    });
  });

  describe('non-JSON error responses', () => {
    it('should preserve status information for HTML error responses', async () => {
      server.use(
        http.get('/api/proxy/test', () => {
          return new HttpResponse(
            '<html><body><h1>502 Bad Gateway</h1></body></html>',
            {
              status: 502,
              statusText: 'Bad Gateway',
              headers: { 'Content-Type': 'text/html' }
            }
          );
        })
      );

      try {
        await apiClient.get('/test');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.message).toBe('Server responded with 502 Bad Gateway');
        expect(apiError.status).toBe(502);
        expect(apiError.code).toBe('UNKNOWN_ERROR');
      }
    });

    it('should handle 504 Gateway Timeout with plain text', async () => {
      server.use(
        http.get('/api/proxy/test', () => {
          return new HttpResponse(
            'Gateway Timeout',
            {
              status: 504,
              statusText: 'Gateway Timeout',
              headers: { 'Content-Type': 'text/plain' }
            }
          );
        })
      );

      try {
        await apiClient.get('/test');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.message).toBe('Server responded with 504 Gateway Timeout');
        expect(apiError.status).toBe(504);
      }
    });

    it('should handle nginx error pages', async () => {
      server.use(
        http.get('/api/proxy/test', () => {
          return new HttpResponse(
            '<html><head><title>503 Service Temporarily Unavailable</title></head><body>nginx</body></html>',
            {
              status: 503,
              statusText: 'Service Temporarily Unavailable',
              headers: { 'Content-Type': 'text/html' }
            }
          );
        })
      );

      try {
        await apiClient.get('/test');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.message).toBe('Server responded with 503 Service Temporarily Unavailable');
        expect(apiError.status).toBe(503);
      }
    });
  });

  describe('successful JSON responses', () => {
    it('should extract data from CommonResponse wrapper', async () => {
      server.use(
        http.get('/api/proxy/test', () => {
          return HttpResponse.json({
            success: true,
            data: { id: 1, name: 'Test Item' }
          });
        })
      );

      const result = await apiClient.get<{ id: number; name: string }>('/test');
      expect(result).toEqual({ id: 1, name: 'Test Item' });
    });

    it('should extract data from RsData wrapper', async () => {
      server.use(
        http.get('/api/proxy/test', () => {
          return HttpResponse.json({
            result: 'SUCCESS',
            data: { id: 2, value: 'Test' }
          });
        })
      );

      const result = await apiClient.get<{ id: number; value: string }>('/test');
      expect(result).toEqual({ id: 2, value: 'Test' });
    });

    it('should handle direct JSON response without wrapper', async () => {
      server.use(
        http.get('/api/proxy/test', () => {
          return HttpResponse.json({ id: 3, name: 'Direct' });
        })
      );

      const result = await apiClient.get<{ id: number; name: string }>('/test');
      expect(result).toEqual({ id: 3, name: 'Direct' });
    });
  });

  describe('network errors', () => {
    it('should throw on network failure', async () => {
      server.use(
        http.get('/api/proxy/test', () => {
          return HttpResponse.error();
        })
      );

      await expect(apiClient.get('/test')).rejects.toThrow();
    });
  });

  describe('RsData FAIL with 200 OK', () => {
    it('should throw ApiError for result=FAIL even with 200 OK', async () => {
      server.use(
        http.get('/api/proxy/test', () => {
          return HttpResponse.json({
            result: 'FAIL',
            message: '작업 실패',
            errorCode: 'OPERATION_FAILED',
            data: null
          });
        })
      );

      try {
        await apiClient.get('/test');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        const apiError = error as ApiError;
        expect(apiError.message).toBe('작업 실패');
        expect(apiError.code).toBe('OPERATION_FAILED');
        expect(apiError.status).toBe(200);
      }
    });
  });
});
