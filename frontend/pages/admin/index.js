import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

function formatNaira(n) {
  return `₦${Number(n).toLocaleString('en-NG')}`;
}

export default function AdminDashboard() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    api
      .get('/admin/orders', token)
      .then((data) => setOrders(data.orders))
      .finally(() => setLoading(false));
  }, [user, token, authLoading, router]);

  if (loading) return <div className="max-w-5xl mx-auto px-6 py-16 text-gray-500">Loading…</div>;

  const revenue = orders.filter((o) => o.payment_status === 'paid').reduce((s, o) => s + Number(o.total_amount), 0);
  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-display font-bold text-3xl">Admin dashboard</h1>
        <div className="flex gap-3">
          <Link href="/admin/products" className="border border-line rounded-md px-4 py-2 text-sm hover:border-cyan transition">
            Manage products
          </Link>
          <Link href="/admin/orders" className="border border-line rounded-md px-4 py-2 text-sm hover:border-cyan transition">
            Manage orders
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-10">
        <div className="bg-surface border border-line rounded-xl p-5">
          <p className="font-mono text-xs text-gray-500 uppercase">Total orders</p>
          <p className="font-display font-bold text-2xl mt-2">{orders.length}</p>
        </div>
        <div className="bg-surface border border-line rounded-xl p-5">
          <p className="font-mono text-xs text-gray-500 uppercase">Paid revenue</p>
          <p className="font-display font-bold text-2xl mt-2 text-cyan">{formatNaira(revenue)}</p>
        </div>
        <div className="bg-surface border border-line rounded-xl p-5">
          <p className="font-mono text-xs text-gray-500 uppercase">Pending orders</p>
          <p className="font-display font-bold text-2xl mt-2 text-amber">{pendingCount}</p>
        </div>
      </div>

      <h2 className="font-display font-semibold text-xl mb-4">Recent orders</h2>
      <div className="flex flex-col gap-3">
        {orders.slice(0, 8).map((o) => (
          <div key={o.id} className="flex justify-between items-center bg-surface border border-line rounded-lg px-5 py-3 text-sm">
            <span className="font-mono">#{o.id.slice(0, 8)}</span>
            <span>{o.customer_name}</span>
            <span className="font-mono">{formatNaira(o.total_amount)}</span>
            <span className="uppercase text-xs text-gray-400">{o.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
