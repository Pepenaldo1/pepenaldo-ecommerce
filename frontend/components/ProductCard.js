import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useRouter } from 'next/router';

const categoryColor = {
  tech: '#00E5FF',
  food: '#FFB020',
  fashion: '#FF2E92',
};

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const router = useRouter();
  const [status, setStatus] = useState('idle'); // idle | adding | added
  const color = categoryColor[product.category_slug] || '#00E5FF';

  async function handleAdd(e) {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    setStatus('adding');
    try {
      await addToCart(product.id, 1);
      setStatus('added');
      setTimeout(() => setStatus('idle'), 1200);
    } catch (err) {
      alert(err.message);
      setStatus('idle');
    }
  }

  return (
    <Link
      href={`/product/${product.id}`}
      className="group bg-surface border border-line rounded-xl p-5 flex flex-col gap-3 transition hover:-translate-y-1"
      style={{ '--glow': color }}
    >
      <div
        className="w-full aspect-square rounded-lg bg-bg flex items-center justify-center text-3xl overflow-hidden"
        style={{ boxShadow: `inset 0 0 0 1px ${color}33` }}
      >
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span style={{ color }}>◆</span>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-base">{product.name}</h3>
        <p className="font-mono text-[10px] text-gray-500 tracking-wide mt-1">
          {product.stock > 0 ? `${product.stock} IN STOCK` : 'OUT OF STOCK'}
        </p>
        <p className="font-mono text-[10px] text-gray-600 tracking-wide mt-0.5">
          Sold by {product.vendor_name || 'Pepenaldo'}
          {product.vendor_verified && <span className="text-cyan"> ✓</span>}
        </p>
      </div>

      <div className="mt-auto pt-3 border-t border-line flex items-center justify-between">
        <span className="font-mono font-semibold">{formatPrice(product.price)}</span>
        <button
          onClick={handleAdd}
          disabled={product.stock === 0 || status === 'adding'}
          className="text-xs font-display font-semibold uppercase tracking-wide px-3 py-1.5 rounded-md border transition disabled:opacity-40"
          style={{ borderColor: color, color: status === 'added' ? '#0A0E17' : color, backgroundColor: status === 'added' ? color : 'transparent' }}
        >
          {status === 'added' ? 'Added' : product.stock === 0 ? 'Sold out' : 'Add'}
        </button>
      </div>
    </Link>
  );
}
