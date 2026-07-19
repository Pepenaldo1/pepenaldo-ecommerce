import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import ProductCard from '../components/ProductCard';

export default function BestSellers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products/meta/best-sellers').then((data) => setProducts(data.products)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-display font-bold text-3xl mb-2">Best Sellers</h1>
      <p className="text-gray-500 mb-8 font-mono text-sm">
        Ranked by real units sold from completed, paid orders.
      </p>

      {loading ? (
        <p className="text-gray-500 font-mono text-sm">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500 font-mono text-sm">No sales yet — check back once orders start coming in.</p>
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
