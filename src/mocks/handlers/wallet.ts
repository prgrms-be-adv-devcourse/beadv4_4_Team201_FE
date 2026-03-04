import { http, HttpResponse, HttpHandler } from 'msw';
import { walletBalance, walletTransactions, WalletTransaction, setWalletBalance } from '../data/mock-data';

export const walletHandlers: HttpHandler[] = [
  http.get('**/api/v2/wallet/balance', () => {
    return HttpResponse.json({
      walletId: 1,
      balance: walletBalance,
    });
  }),

  http.get('**/api/v2/wallet/history', ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');

    let filtered = walletTransactions;
    if (type) {
      filtered = walletTransactions.filter((t) => t.type === type);
    }

    filtered = [...filtered].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const start = page * size;
    const end = start + size;
    const paginated = filtered.slice(start, end);

    return HttpResponse.json({
      result: 'SUCCESS',
      data: {
        content: paginated,
        pageable: {
          pageNumber: page,
          pageSize: size,
          sort: { empty: true, sorted: false, unsorted: true },
          offset: page * size,
          paged: true,
          unpaged: false,
        },
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size),
        last: end >= filtered.length,
        size,
        number: page,
        sort: { empty: true, sorted: false, unsorted: true },
        numberOfElements: paginated.length,
        first: page === 0,
        empty: paginated.length === 0,
      },
    });
  }),

  http.post('**/api/v2/wallet/charge', async ({ request }) => {
    const body = await request.json();
    const { amount } = body as { amount: number };

    const newBalance = walletBalance + amount;
    setWalletBalance(newBalance);

    const newTransaction: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'CHARGE',
      amount,
      balanceAfter: newBalance,
      description: '포인트 충전',
      relatedId: null,
      createdAt: new Date().toISOString(),
    };
    walletTransactions.unshift(newTransaction);

    return HttpResponse.json({
      chargeId: newTransaction.id,
      paymentUrl: 'https://payment.example.com/mock',
      amount,
    });
  }),

  http.post('**/api/v2/wallet/withdraw', async ({ request }) => {
    const body = await request.json();
    const { amount, bankCode } = body as {
      amount: number;
      bankCode: string;
    };

    if (amount > walletBalance) {
      return HttpResponse.json(
        { error: 'INSUFFICIENT_BALANCE', message: '잔액이 부족합니다.' },
        { status: 400 }
      );
    }

    const newBalance = walletBalance - amount;
    setWalletBalance(newBalance);

    const bankNames: Record<string, string> = {
      '004': 'KB국민은행',
      '088': '신한은행',
      '020': '우리은행',
      '081': '하나은행',
    };

    const newTransaction: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'WITHDRAW',
      amount: -amount,
      balanceAfter: newBalance,
      description: `${bankNames[bankCode] || '은행'} 출금`,
      relatedId: null,
      createdAt: new Date().toISOString(),
    };
    walletTransactions.unshift(newTransaction);

    return HttpResponse.json({
      walletId: 1,
      balance: newBalance,
      withdrawnAmount: amount,
      transactionId: newTransaction.id,
      status: 'PENDING',
    });
  }),
];
