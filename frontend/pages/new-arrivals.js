import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import ProductCard from '../components/ProductCard';
import Seo from '../components/Seo';

export default function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products').then((data) => setProducts(data.products.slice(0, 20))).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <Seo title="New Arrivals" description="The newest products listed on Pepenaldo, freshest first." path="/new-arrivals" />
      <h1 className="font-display font-bold text-3xl mb-2">New Arrivals</h1>
      <p className="text-gray-500 mb-8 font-mono text-sm">The most recently listed products, newest first.</p>

      {loading ? (
        <p className="text-gray-500 font-mono text-sm">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500 font-mono text-sm">No products yet.</p>
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
