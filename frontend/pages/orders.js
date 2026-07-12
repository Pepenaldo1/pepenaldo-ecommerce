import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

function formatNaira(n) {
  return `₦${Number(n).toLocaleString('en-NG')}`;
}

const statusColor = {
  pending: 'text-gray-400',
  paid: 'text-cyan',
  shipped: 'text-amber',
  delivered: 'text-green-400',
  cancelled: 'text-magenta',
};

export default function Orders() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    api
      .get('/orders/mine', token)
      .then((data) => setOrders(data.orders))
      .finally(() => setLoading(false));
  }, [user, token, authLoading, router]);

  if (loading) return <div className="max-w-3xl mx-auto px-6 py-16 text-gray-500">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-display font-bold text-3xl mb-8">Your orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-surface border border-line rounded-xl p-5">
              <div className="flex justify-between items-center">
                <span className="font-mono text-sm">#{o.id.slice(0, 8)}</span>
                <span className={`font-mono text-xs uppercase ${statusColor[o.status] || ''}`}>
                  {o.status}
                </span>
              </div>
              <div className="flex justify-between mt-3 text-sm text-gray-400">
                <span>{new Date(o.created_at).toLocaleDateString()}</span>
                <span className="font-mono">{formatNaira(o.total_amount)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
