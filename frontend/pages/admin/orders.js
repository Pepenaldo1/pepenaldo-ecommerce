import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

function formatNaira(n) {
  return `₦${Number(n).toLocaleString('en-NG')}`;
}

const statuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    const data = await api.get('/admin/orders', token);
    setOrders(data.orders);
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    loadOrders().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  async function handleStatusChange(id, status) {
    await api.put(`/admin/orders/${id}/status`, { status }, token);
    await loadOrders();
  }

  if (loading) return <div className="max-w-5xl mx-auto px-6 py-16 text-gray-500">Loading…</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-display font-bold text-3xl mb-8">Manage orders</h1>

      <div className="flex flex-col gap-3">
        {orders.map((o) => (
          <div key={o.id} className="bg-surface border border-line rounded-xl p-5">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div>
                <p className="font-mono text-sm">#{o.id.slice(0, 8)}</p>
                <p className="text-sm text-gray-400">{o.customer_name} · {o.customer_email}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono font-semibold">{formatNaira(o.total_amount)}</span>
                <span className={`font-mono text-xs uppercase ${o.payment_status === 'paid' ? 'text-cyan' : 'text-gray-500'}`}>
                  {o.payment_status}
                </span>
                <select
                  value={o.status}
                  onChange={(e) => handleStatusChange(o.id, e.target.value)}
                  className="bg-bg border border-line rounded-md px-3 py-1.5 text-sm font-mono"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 font-mono">
              Ship to: {o.shipping_address} · {o.shipping_phone}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
