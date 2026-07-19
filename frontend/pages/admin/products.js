import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const emptyForm = { name: '', description: '', price: '', stock: '', image_url: '', category_id: '', compare_at_price: '', featured: false };

function formatNaira(n) {
  return `₦${Number(n).toLocaleString('en-NG')}`;
}

export default function AdminProducts() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);

  async function loadProducts() {
    const data = await api.get('/products');
    setProducts(data.products);
  }

  async function loadCategories() {
    const data = await api.get('/products/meta/categories');
    setCategories(data.categories);
  }

  async function loadSettings() {
    const data = await api.get('/settings');
    setHeroImageUrl(data.settings.hero_image_url || '');
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    Promise.all([loadProducts(), loadCategories(), loadSettings()]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  async function handleSaveSettings(e) {
    e.preventDefault();
    await api.put('/admin/settings', { hero_image_url: heroImageUrl }, token);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  }

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
      compare_at_price: p.compare_at_price || '',
      featured: !!p.featured,
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
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
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

  async function handleAddCategory(e) {
    e.preventDefault();
    setCategoryError('');
    try {
      await api.post('/admin/categories', { name: newCategoryName }, token);
      setNewCategoryName('');
      await loadCategories();
    } catch (err) {
      setCategoryError(err.message);
    }
  }

  if (loading) return <div className="max-w-5xl mx-auto px-6 py-16 text-gray-500">Loading…</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-display font-bold text-3xl mb-8">Manage products</h1>

      <form onSubmit={handleSaveSettings} className="bg-surface border border-line rounded-xl p-6 mb-6 flex gap-3 items-start flex-wrap">
        <input
          placeholder="Homepage hero image URL"
          value={heroImageUrl}
          onChange={(e) => setHeroImageUrl(e.target.value)}
          className="bg-bg border border-line rounded-md px-4 py-2.5 flex-1 min-w-[200px] focus:outline-none focus:border-cyan"
        />
        <button type="submit" className="border border-cyan text-cyan font-display font-semibold uppercase tracking-wide px-5 py-2.5 rounded-md">
          {settingsSaved ? 'Saved ✓' : 'Save hero image'}
        </button>
        <p className="text-gray-500 text-xs font-mono w-full">
          This image appears on the homepage hero banner. Leave blank to show the placeholder.
        </p>
      </form>

      <form onSubmit={handleAddCategory} className="bg-surface border border-line rounded-xl p-6 mb-6 flex gap-3 items-start flex-wrap">
        <input
          required
          placeholder="New category name (e.g. Ebooks, Movies)"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="bg-bg border border-line rounded-md px-4 py-2.5 flex-1 min-w-[200px] focus:outline-none focus:border-cyan"
        />
        <button type="submit" className="border border-cyan text-cyan font-display font-semibold uppercase tracking-wide px-5 py-2.5 rounded-md">
          Add category
        </button>
        {categoryError && <p className="text-magenta text-sm font-mono w-full">{categoryError}</p>}
        <p className="text-gray-500 text-xs font-mono w-full">
          Current categories: {categories.map((c) => c.name).join(', ') || 'none yet'}
        </p>
      </form>

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
        <select
          required
          value={form.category_id}
          onChange={(e) => update('category_id', e.target.value)}
          className="bg-bg border border-line rounded-md px-4 py-2.5 focus:outline-none focus:border-cyan"
        >
          <option value="">Select a category…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Original price ₦ (optional — shows as a discount)"
          value={form.compare_at_price}
          onChange={(e) => update('compare_at_price', e.target.value)}
          className="bg-bg border border-line rounded-md px-4 py-2.5 focus:outline-none focus:border-cyan"
        />
        <label className="flex items-center gap-2 text-sm text-gray-400 md:col-span-2">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => update('featured', e.target.checked)}
            className="accent-cyan"
          />
          Show in "Featured deals" on the homepage
        </label>
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
