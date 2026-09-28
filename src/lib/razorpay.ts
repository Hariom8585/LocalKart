import crypto from 'crypto';

export interface RazorpayOrderOptions {
  amount: number; // in paise (e.g. 100 INR = 10000 paise)
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: 'created' | 'attempted' | 'paid';
  is_mock: boolean;
}

export const RazorpayService = {
  isMockMode: () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const isMock = process.env.MOCK_PAYMENT_ENABLED === 'true';
    return isMock || !keyId || keyId.includes('placeholder') || keyId.includes('mock');
  },

  createOrder: async (options: RazorpayOrderOptions): Promise<RazorpayOrderResponse> => {
    if (RazorpayService.isMockMode()) {
      // Mock order generation
      const mockId = `order_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      return {
        id: mockId,
        entity: 'order',
        amount: options.amount,
        amount_paid: 0,
        amount_due: options.amount,
        currency: options.currency || 'INR',
        receipt: options.receipt,
        status: 'created',
        is_mock: true,
      };
    }

    // Live Razorpay API call
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: options.amount,
        currency: options.currency || 'INR',
        receipt: options.receipt,
        notes: options.notes,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.description || 'Razorpay order creation failed');
    }

    const data = await res.json();
    return { ...data, is_mock: false };
  },

  verifySignature: (
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): boolean => {
    if (RazorpayService.isMockMode()) {
      // Accept valid mock payment signatures
      return razorpaySignature.startsWith('mock_sig_') || razorpaySignature === 'valid_mock_signature';
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === razorpaySignature;
  }
};
