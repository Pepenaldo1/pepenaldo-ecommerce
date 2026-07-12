import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

export default function Cart() {
  const { items, total, updateQuantity, removeItem, loading } = useCart();
  const { formatPrice } = useCurrency();

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-display font-bold text-3xl mb-8">Your cart</h1>

      {loading ? (
        <p className="text-gray-500 font-mono text-sm">Loading…</p>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-6">Your cart is empty.</p>
          <Link href="/" className="text-cyan font-mono text-sm underline">
            Browse the catalog →
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 bg-surface border border-line rounded-xl p-4"
              >
                <div className="w-16 h-16 bg-bg rounded-md flex items-center justify-center flex-shrink-0">
                  {item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-md" />
                  ) : (
                    <span className="text-cyan">◆</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="font-mono text-sm text-gray-400">{formatPrice(item.price)}</p>
                </div>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, Math.max(1, Number(e.target.value)))}
                  className="w-16 bg-bg border border-line rounded-md px-2 py-1 font-mono text-center"
                />
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-gray-500 hover:text-magenta transition text-sm font-mono"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-line">
            <span className="font-mono text-gray-400">Total</span>
            <span className="font-mono text-xl font-semibold">{formatPrice(total)}</span>
          </div>

          <Link
            href="/checkout"
            className="block text-center mt-6 bg-cyan text-bg font-display font-semibold uppercase tracking-wide py-3 rounded-md hover:shadow-[0_0_24px_#00E5FF55] transition"
          >
            Proceed to checkout
          </Link>
        </>
      )}
    </div>
  );
}
