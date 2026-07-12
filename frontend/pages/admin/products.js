import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const emptyForm = { name: '', description: '', price: '', stock: '', image_url: '', category_id: '' };

function formatNaira(n) {
  return `₦${Number(n).toLocaleString('en-NG')}`;
}

export default function AdminProducts() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadProducts() {
    const data = await api.get('/products');
    setProducts(data.products);
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    loadProducts().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function startEdit(p) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || '',
      price: p.price,
      stock: p.stock,
      image_url: p.image_url || '',
      category_id: p.category_id || '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      category_id: form.category_id || null,
    };
    try {
      if (editingId) {
        await api.put(`/admin/products/${editingId}`, payload, token);
      } else {
        await api.post('/admin/products', payload, token);
      }
      cancelEdit();
      await loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return;
    await api.del(`/admin/products/${id}`, token);
    await loadProducts();
  }

  if (loading) return <div className="max-w-5xl mx-auto px-6 py-16 text-gray-500">Loading…</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-display font-bold text-3xl mb-8">Manage products</h1>

      <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-xl p-6 mb-10 grid md:grid-cols-2 gap-4">
        <input
          required
          placeholder="Product name"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          className="bg-bg border border-line rounded-md px-4 py-2.5 focus:outline-none focus:border-cyan"
        />
        <input
          required
          type="number"
          placeholder="Price (₦)"
          value={form.price}
          onChange={(e) => update('price', e.target.value)}
          className="bg-bg border border-line rounded-md px-4 py-2.5 focus:outline-none focus:border-cyan"
        />
        <input
          required
          type="number"
          placeholder="Stock quantity"
          value={form.stock}
          onChange={(e) => update('stock', e.target.value)}
          className="bg-bg border border-line rounded-md px-4 py-2.5 focus:outline-none focus:border-cyan"
        />
        <input
          placeholder="Image URL"
          value={form.image_url}
          onChange={(e) => update('image_url', e.target.value)}
          className="bg-bg border border-line rounded-md px-4 py-2.5 focus:outline-none focus:border-cyan"
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          className="bg-bg border border-line rounded-md px-4 py-2.5 md:col-span-2 focus:outline-none focus:border-cyan"
          rows={2}
        />
        {error && <p className="text-magenta text-sm font-mono md:col-span-2">{error}</p>}
        <div className="flex gap-3 md:col-span-2">
          <button type="submit" className="bg-cyan text-bg font-display font-semibold uppercase tracking-wide px-6 py-2.5 rounded-md">
            {editingId ? 'Update product' : 'Add product'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="border border-line px-6 py-2.5 rounded-md text-gray-400">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="flex flex-col gap-3">
        {products.map((p) => (
          <div key={p.id} className="flex items-center justify-between bg-surface border border-line rounded-lg px-5 py-3">
            <div>
              <p className="font-semibold">{p.name}</p>
              <p className="font-mono text-xs text-gray-500">{formatNaira(p.price)} · {p.stock} in stock</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(p)} className="text-sm text-cyan hover:underline">Edit</button>
              <button onClick={() => handleDelete(p.id)} className="text-sm text-magenta hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
