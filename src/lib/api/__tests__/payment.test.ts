import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import {
  createChargePayment,
  confirmPayment,
  type CreateChargePaymentRequest,
  type CreateChargePaymentResponse,
  type ConfirmPaymentRequest,
  type ConfirmPaymentResponse,
} from '../payment';

// MSW 서버 설정 - 프록시 경로 사용 (/api/proxy)
const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Payment API', () => {
  describe('createChargePayment', () => {
    const mockRequest: CreateChargePaymentRequest = {
      amount: 10000,
    };

    const mockResponse: CreateChargePaymentResponse = {
      paymentId: 123,
      orderId: 'CHG-test-order-id',
      amount: 10000,
      idempotencyKey: 'test-idempotency-key',
      status: 'PENDING',
    };

    it('성공적으로 Payment를 생성해야 함', async () => {
      server.use(
        http.post('/api/proxy/api/v2/payments/charge', () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await createChargePayment(mockRequest);

      expect(result).toEqual(mockResponse);
    });

    it('orderId를 포함한 요청도 처리해야 함', async () => {
      const requestWithOrderId: CreateChargePaymentRequest = {
        amount: 50000,
        orderId: 'custom-order-id',
      };

      server.use(
        http.post('/api/proxy/api/v2/payments/charge', async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(requestWithOrderId);
          return HttpResponse.json({ ...mockResponse, orderId: 'custom-order-id', amount: 50000 });
        })
      );

      const result = await createChargePayment(requestWithOrderId);

      expect(result.orderId).toBe('custom-order-id');
      expect(result.amount).toBe(50000);
    });

    it('서버 에러 시 예외를 던져야 함', async () => {
      server.use(
        http.post('/api/proxy/api/v2/payments/charge', () => {
          return HttpResponse.json(
            { message: '서버 에러', code: 'INTERNAL_ERROR' },
            { status: 500 }
          );
        })
      );

      await expect(createChargePayment(mockRequest)).rejects.toThrow();
    });
  });

  describe('confirmPayment', () => {
    const mockRequest: ConfirmPaymentRequest = {
      paymentId: 123,
      paymentKey: 'test-payment-key',
      orderId: 'CHG-test-order-id',
      amount: 10000,
    };

    it('결제 승인 성공 시 success: true 반환', async () => {
      const mockResponse: ConfirmPaymentResponse = {
        success: true,
        paymentId: 123,
      };

      server.use(
        http.post('/api/proxy/api/v2/payments/confirm', () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await confirmPayment(mockRequest);

      expect(result.success).toBe(true);
      expect(result.paymentId).toBe(123);
    });

    it('결제 승인 실패 시 에러 정보 반환', async () => {
      const mockResponse: ConfirmPaymentResponse = {
        success: false,
        errorCode: 'AMOUNT_MISMATCH',
        errorMessage: '결제 금액이 일치하지 않습니다.',
      };

      server.use(
        http.post('/api/proxy/api/v2/payments/confirm', () => {
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await confirmPayment(mockRequest);

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('AMOUNT_MISMATCH');
      expect(result.errorMessage).toBe('결제 금액이 일치하지 않습니다.');
    });

    it('요청 파라미터가 올바르게 전송되어야 함', async () => {
      server.use(
        http.post('/api/proxy/api/v2/payments/confirm', async ({ request }) => {
          const body = await request.json();

          expect(body).toEqual({
            paymentId: 123,
            paymentKey: 'test-payment-key',
            orderId: 'CHG-test-order-id',
            amount: 10000,
          });

          return HttpResponse.json({ success: true, paymentId: 123 });
        })
      );

      await confirmPayment(mockRequest);
    });

    it('네트워크 에러 시 예외를 던져야 함', async () => {
      server.use(
        http.post('/api/proxy/api/v2/payments/confirm', () => {
          return HttpResponse.error();
        })
      );

      await expect(confirmPayment(mockRequest)).rejects.toThrow();
    });
  });
});

describe('Payment API Types', () => {
  it('CreateChargePaymentRequest 타입이 올바르게 정의되어야 함', () => {
    const request: CreateChargePaymentRequest = {
      amount: 10000,
    };
    expect(request.amount).toBe(10000);

    const requestWithOrderId: CreateChargePaymentRequest = {
      amount: 10000,
      orderId: 'custom-id',
    };
    expect(requestWithOrderId.orderId).toBe('custom-id');
  });

  it('ConfirmPaymentRequest 타입이 올바르게 정의되어야 함', () => {
    const request: ConfirmPaymentRequest = {
      paymentId: 1,
      paymentKey: 'key',
      orderId: 'order',
      amount: 1000,
    };

    expect(request.paymentId).toBe(1);
    expect(request.paymentKey).toBe('key');
    expect(request.orderId).toBe('order');
    expect(request.amount).toBe(1000);
  });
});
