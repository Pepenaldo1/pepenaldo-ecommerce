import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { api } from '../lib/api';

function formatNaira(n) {
  return `₦${Number(n).toLocaleString('en-NG')}`;
}

export default function Checkout() {
  const { user, token } = useAuth();
  const { items, total } = useCart();
  const { formatPrice, showNaira } = useCurrency();
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    if (typeof window !== 'undefined') router.push('/login');
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.post(
        '/orders/checkout',
        { shipping_address: address, shipping_phone: phone },
        token
      );
      // Redirect to Paystack's hosted payment page.
      window.location.href = data.authorization_url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-display font-bold text-3xl mb-8">Checkout</h1>

      <div className="bg-surface border border-line rounded-xl p-5 mb-8">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between py-2 text-sm font-mono">
            <span>{item.name} × {item.quantity}</span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-3 mt-3 border-t border-line font-semibold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        {!showNaira && (
          <p className="text-xs text-gray-500 font-mono mt-3">
            Shown in USD for reference. You'll be charged {formatNaira(total)} (Naira) on the next screen.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Shipping address</label>
          <textarea
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className="w-full bg-surface border border-line rounded-md px-4 py-3 focus:outline-none focus:border-cyan"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Phone number</label>
          <input
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-surface border border-line rounded-md px-4 py-3 focus:outline-none focus:border-cyan"
          />
        </div>

        {error && <p className="text-magenta text-sm font-mono">{error}</p>}

        <button
          type="submit"
          disabled={loading || items.length === 0}
          className="mt-2 bg-cyan text-bg font-display font-semibold uppercase tracking-wide py-3 rounded-md hover:shadow-[0_0_24px_#A855F755] transition disabled:opacity-40"
        >
          {loading ? 'Redirecting to Paystack…' : 'Pay with Paystack'}
        </button>
      </form>
    </div>
  );
}
