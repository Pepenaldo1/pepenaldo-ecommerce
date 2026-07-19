import Link from 'next/link';
import { useState } from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useWishlist } from '../context/WishlistContext';
import { useRouter } from 'next/router';

const categoryColor = {
  tech: '#A855F7',
  food: '#FBBF24',
  fashion: '#F472B6',
};

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { toggle, isSaved } = useWishlist();
  const router = useRouter();
  const [status, setStatus] = useState('idle'); // idle | adding | added
  const color = categoryColor[product.category_slug] || '#A855F7';

  // A discount badge only ever appears when a real compare_at_price was set
  // by the seller — never a fabricated percentage.
  const hasDiscount = product.compare_at_price && Number(product.compare_at_price) > Number(product.price);
  const discountPct = hasDiscount
    ? Math.round((1 - Number(product.price) / Number(product.compare_at_price)) * 100)
    : null;

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

  function handleWishlist(e) {
    e.preventDefault();
    toggle(product.id);
  }

  return (
    <Link
      href={`/product/${product.id}`}
      className="group bg-surface border border-line rounded-xl p-4 flex flex-col gap-3 transition hover:-translate-y-1 relative"
      style={{ '--glow': color }}
    >
      {hasDiscount && (
        <span className="absolute top-3 left-3 z-10 bg-magenta text-white text-xs font-display font-bold px-2 py-1 rounded-md">
          -{discountPct}%
        </span>
      )}
      <button
        onClick={handleWishlist}
        aria-label="Save to wishlist"
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-bg/70 backdrop-blur flex items-center justify-center"
      >
        <Heart
          size={16}
          fill={isSaved(product.id) ? '#F472B6' : 'none'}
          color={isSaved(product.id) ? '#F472B6' : '#9CA3AF'}
        />
      </button>

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
        <p className="font-mono text-[10px] uppercase tracking-wide" style={{ color }}>
          {product.category_name || 'General'}
        </p>
        <h3 className="font-semibold text-base leading-snug">{product.name}</h3>
        {product.review_count > 0 ? (
          <div className="flex items-center gap-1 mt-1">
            <Star size={12} fill="#FBBF24" color="#FBBF24" />
            <span className="text-xs font-mono text-gray-300">{Number(product.avg_rating).toFixed(1)}</span>
            <span className="text-xs font-mono text-gray-600">({product.review_count})</span>
          </div>
        ) : (
          <p className="text-xs font-mono text-gray-600 mt-1">No reviews yet</p>
        )}
        <p className="font-mono text-[10px] text-gray-600 tracking-wide mt-1">
          Sold by {product.vendor_name || 'Pepenaldo'}
          {product.vendor_verified && <span className="text-cyan"> ✓</span>}
        </p>
      </div>

      <div className="mt-auto pt-3 border-t border-line flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="font-mono text-xs text-gray-500 line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>
          <p className="font-mono text-[10px] text-gray-500 tracking-wide">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>
        </div>
        <button
          onClick={handleAdd}
          disabled={product.stock === 0 || status === 'adding'}
          className="w-9 h-9 rounded-md border flex items-center justify-center transition disabled:opacity-40"
          style={{
            borderColor: color,
            backgroundColor: status === 'added' ? color : 'transparent',
          }}
        >
          <ShoppingCart size={16} color={status === 'added' ? '#0B0A17' : color} />
        </button>
      </div>
    </Link>
  );
}
