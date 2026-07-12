import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../lib/api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const router = useRouter();
  const { category } = router.query;
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products/meta/categories').then((data) => setCategories(data.categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);

    api
      .get(`/products?${params.toString()}`)
      .then((data) => setProducts(data.products))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [category, search]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <section className="mb-10">
        <p className="font-mono text-cyan text-sm mb-3">// ALL SYSTEMS OPERATIONAL</p>
        <h1 className="font-display font-bold text-4xl md:text-6xl leading-none max-w-2xl">
          Tech, food & fashion — one cart.
        </h1>
        <p className="text-gray-400 mt-4 max-w-lg">
          Browse the full Pepenaldo catalog. Filter by world, search by name, checkout in seconds.
        </p>
      </section>

      <div className="flex flex-wrap items-center gap-3 mb-8">
        <button
          onClick={() => router.push('/')}
          className={`px-4 py-2 rounded-md text-sm font-display font-semibold uppercase tracking-wide border transition ${
            !category ? 'bg-cyan text-bg border-cyan' : 'border-line text-gray-400 hover:text-white'
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => router.push(`/?category=${c.slug}`)}
            className={`px-4 py-2 rounded-md text-sm font-display font-semibold uppercase tracking-wide border transition ${
              category === c.slug ? 'bg-cyan text-bg border-cyan' : 'border-line text-gray-400 hover:text-white'
            }`}
          >
            {c.name}
          </button>
        ))}
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-auto bg-surface border border-line rounded-md px-4 py-2 text-sm font-mono focus:outline-none focus:border-cyan"
        />
      </div>

      {loading ? (
        <p className="text-gray-500 font-mono text-sm">Loading catalog…</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500 font-mono text-sm">No products match that search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
