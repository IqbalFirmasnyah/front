import { useState } from 'react';

interface PaymentData {
  paymentId: number;
  snapToken: string;
  redirectUrl: string;
  orderId: string;
}

interface PaymentResult {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
}

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: {
        onSuccess?: (result: PaymentResult) => void;
        onPending?: (result: PaymentResult) => void;
        onError?: (result: PaymentResult) => void;
        onClose?: () => void;
      }) => void;
    };
  }
}

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = async (bookingId: number): Promise<PaymentData | null> => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login kembali.');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/create/${bookingId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal membuat pembayaran');
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const processPayment = (
    snapToken: string,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    if (!window.snap) {
      setError('Midtrans Snap belum dimuat. Silakan refresh halaman.');
      return;
    }

    window.snap.pay(snapToken, {
      onSuccess: function(result) {
        console.log('Payment success:', result);
        if (onSuccess) onSuccess();
      },
      onPending: function(result) {
        console.log('Payment pending:', result);
        alert('Pembayaran tertunda. Silakan selesaikan pembayaran Anda.');
      },
      onError: function(result) {
        console.log('Payment error:', result);
        const errorMessage = `Pembayaran gagal: ${result.status_message}`;
        setError(errorMessage);
        if (onError) onError(errorMessage);
      },
      onClose: function() {
        console.log('Payment popup closed by user');
      }
    });
  };

  const getPaymentStatus = async (paymentId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login kembali.');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/status/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengecek status pembayaran');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  return {
    createPayment,
    processPayment,
    getPaymentStatus,
    loading,
    error,
    clearError: () => setError(null),
  };
};