import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-bg/85 backdrop-blur border-b border-line">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="font-display font-bold text-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan shadow-[0_0_10px_#00E5FF]" />
          PEPENALDO
        </Link>

        <div className="hidden md:flex gap-8 text-sm uppercase tracking-wide text-gray-400">
          <Link href="/?category=tech" className="hover:text-white transition">Tech</Link>
          <Link href="/?category=food" className="hover:text-white transition">Food</Link>
          <Link href="/?category=fashion" className="hover:text-white transition">Fashion</Link>
          {user?.role === 'admin' && (
            <Link href="/admin" className="hover:text-cyan transition">Admin</Link>
          )}
        </div>

        <div className="flex items-center gap-4 font-mono text-sm">
          <Link href="/cart" className="border border-line rounded-md px-3 py-1.5 hover:border-cyan transition">
            CART <span className="bg-cyan text-bg font-bold rounded px-1.5 ml-1">{count}</span>
          </Link>
          {user ? (
            <>
              <Link href="/orders" className="text-gray-400 hover:text-white transition hidden sm:inline">
                Orders
              </Link>
              <button onClick={logout} className="text-gray-400 hover:text-white transition">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="text-gray-400 hover:text-white transition">
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
