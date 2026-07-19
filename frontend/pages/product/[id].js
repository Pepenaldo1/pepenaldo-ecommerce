import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../../lib/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (!id) return;
    api
      .get(`/products/${id}`)
      .then((data) => setProduct(data.product))
      .catch((err) => console.error(err));
  }, [id]);

  async function handleAdd() {
    if (!user) {
      router.push('/login');
      return;
    }
    setStatus('adding');
    try {
      await addToCart(product.id, qty);
      setStatus('added');
      setTimeout(() => setStatus('idle'), 1500);
    } catch (err) {
      alert(err.message);
      setStatus('idle');
    }
  }

  if (!product) return <div className="max-w-4xl mx-auto px-6 py-16 text-gray-500">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10">
      <div className="aspect-square bg-surface border border-line rounded-xl flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl text-cyan">◆</span>
        )}
      </div>

      <div>
        <p className="font-mono text-xs text-gray-500 uppercase tracking-wide">
          {product.category_name || 'Uncategorized'}
        </p>
        <h1 className="font-display font-bold text-3xl mt-2">{product.name}</h1>
        <p className="font-mono text-2xl text-cyan mt-4">{formatPrice(product.price)}</p>
        <p className="text-gray-400 mt-6 leading-relaxed">{product.description || 'No description provided.'}</p>

        <p className="font-mono text-xs text-gray-500 mt-6">
          {product.stock > 0 ? `${product.stock} units in stock` : 'Out of stock'}
        </p>

        <div className="flex items-center gap-4 mt-6">
          <input
            type="number"
            min="1"
            max={product.stock}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
            className="w-20 bg-surface border border-line rounded-md px-3 py-2 font-mono text-center"
          />
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="flex-1 bg-cyan text-bg font-display font-semibold uppercase tracking-wide py-3 rounded-md hover:shadow-[0_0_24px_#A855F755] transition disabled:opacity-40"
          >
            {status === 'added' ? 'Added to cart' : product.stock === 0 ? 'Sold out' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
