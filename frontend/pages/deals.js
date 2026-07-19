import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import ProductCard from '../components/ProductCard';

export default function Deals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/products?featured=true')
      .then((data) => setProducts(data.products))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-display font-bold text-3xl mb-2">Deals</h1>
      <p className="text-gray-500 mb-8 font-mono text-sm">
        Real discounts set by sellers — no inflated numbers.
      </p>

      {loading ? (
        <p className="text-gray-500 font-mono text-sm">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500 font-mono text-sm">No active deals right now — check back soon.</p>
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
