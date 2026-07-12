import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { api } from '../../lib/api';

export default function VerifyPayment() {
  const router = useRouter();
  const { reference } = router.query;
  const { token } = useAuth();
  const { refreshCart } = useCart();
  const [state, setState] = useState('checking'); // checking | success | failed

  useEffect(() => {
    if (!reference || !token) return;
    api
      .get(`/orders/verify/${reference}`, token)
      .then(() => {
        setState('success');
        refreshCart();
      })
      .catch(() => setState('failed'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference, token]);

  return (
    <div className="max-w-lg mx-auto px-6 py-24 text-center">
      {state === 'checking' && <p className="font-mono text-gray-400">Confirming your payment…</p>}
      {state === 'success' && (
        <>
          <h1 className="font-display font-bold text-2xl text-cyan mb-3">Payment confirmed 🎉</h1>
          <p className="text-gray-400 mb-8">
            Your order is being processed. A confirmation email is on its way to you.
          </p>
          <Link href="/orders" className="text-cyan font-mono text-sm underline">
            View your orders →
          </Link>
        </>
      )}
      {state === 'failed' && (
        <>
          <h1 className="font-display font-bold text-2xl text-magenta mb-3">Payment not confirmed</h1>
          <p className="text-gray-400 mb-8">
            If you were charged, contact support with reference <span className="font-mono">{reference}</span>.
          </p>
          <Link href="/cart" className="text-cyan font-mono text-sm underline">
            Back to cart →
          </Link>
        </>
      )}
    </div>
  );
}
