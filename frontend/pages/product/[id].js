import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Star } from 'lucide-react';
import { api } from '../../lib/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user, token } = useAuth();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [qty, setQty] = useState(1);
  const [status, setStatus] = useState('idle');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/products/${id}`).then((data) => setProduct(data.product)).catch((err) => console.error(err));
    api.get(`/products/${id}/reviews`).then((data) => setReviews(data.reviews)).catch((err) => console.error(err));
  }, [id]);

  const hasDiscount = product?.compare_at_price && Number(product.compare_at_price) > Number(product.price);

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

  async function handleReviewSubmit(e) {
    e.preventDefault();
    setReviewError('');
    setReviewSubmitting(true);
    try {
      await api.post(`/products/${id}/reviews`, { rating: reviewRating, comment: reviewComment }, token);
      const data = await api.get(`/products/${id}/reviews`);
      setReviews(data.reviews);
      const updated = await api.get(`/products/${id}`);
      setProduct(updated.product);
      setReviewComment('');
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setReviewSubmitting(false);
    }
  }

  if (!product) return <div className="max-w-4xl mx-auto px-6 py-16 text-gray-500">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="grid md:grid-cols-2 gap-10">
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

          {product.review_count > 0 ? (
            <div className="flex items-center gap-1.5 mt-2">
              <Star size={16} fill="#FBBF24" color="#FBBF24" />
              <span className="font-mono text-sm">{Number(product.avg_rating).toFixed(1)}</span>
              <span className="font-mono text-sm text-gray-500">({product.review_count} review{product.review_count === 1 ? '' : 's'})</span>
            </div>
          ) : (
            <p className="font-mono text-sm text-gray-600 mt-2">No reviews yet</p>
          )}

          <div className="flex items-center gap-3 mt-4">
            <p className="font-mono text-2xl text-cyan">{formatPrice(product.price)}</p>
            {hasDiscount && (
              <p className="font-mono text-lg text-gray-500 line-through">{formatPrice(product.compare_at_price)}</p>
            )}
          </div>
          <p className="text-gray-400 mt-6 leading-relaxed">{product.description || 'No description provided.'}</p>

          <p className="font-mono text-xs text-gray-500 mt-6">
            {product.stock > 0 ? `${product.stock} units in stock` : 'Out of stock'}
          </p>
          <p className="font-mono text-xs text-gray-600 mt-1">
            Sold by {product.vendor_name || 'Pepenaldo'}
            {product.vendor_verified && <span className="text-cyan"> ✓ Verified</span>}
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

      {/* Reviews — every one of these came from a real, paid order. */}
      <div className="mt-16 border-t border-line pt-10">
        <h2 className="font-display font-bold text-xl mb-6">Reviews</h2>

        {reviews.length === 0 ? (
          <p className="text-gray-500 font-mono text-sm mb-8">No reviews yet — be the first to buy and review this.</p>
        ) : (
          <div className="flex flex-col gap-4 mb-10">
            {reviews.map((r) => (
              <div key={r.id} className="bg-surface border border-line rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill={i < r.rating ? '#FBBF24' : 'none'} color="#FBBF24" />
                  ))}
                  <span className="font-semibold text-sm ml-2">{r.user_name}</span>
                </div>
                {r.comment && <p className="text-gray-400 text-sm">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}

        {user ? (
          <form onSubmit={handleReviewSubmit} className="bg-surface border border-line rounded-xl p-6">
            <p className="font-semibold mb-3">Write a review</p>
            <p className="text-xs text-gray-500 font-mono mb-4">
              Only customers with a paid order for this product can review it.
            </p>
            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <button type="button" key={i} onClick={() => setReviewRating(i + 1)}>
                  <Star size={22} fill={i < reviewRating ? '#FBBF24' : 'none'} color="#FBBF24" />
                </button>
              ))}
            </div>
            <textarea
              placeholder="Share your experience (optional)"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={3}
              className="w-full bg-bg border border-line rounded-md px-4 py-2.5 focus:outline-none focus:border-cyan mb-3"
            />
            {reviewError && <p className="text-magenta text-sm font-mono mb-3">{reviewError}</p>}
            <button
              type="submit"
              disabled={reviewSubmitting}
              className="bg-cyan text-bg font-display font-semibold uppercase tracking-wide px-6 py-2.5 rounded-md disabled:opacity-50"
            >
              {reviewSubmitting ? 'Submitting…' : 'Submit review'}
            </button>
          </form>
        ) : (
          <p className="text-gray-500 font-mono text-sm">
            <a href="/login" className="text-cyan underline">Log in</a> to write a review.
          </p>
        )}
      </div>
    </div>
  );
}
