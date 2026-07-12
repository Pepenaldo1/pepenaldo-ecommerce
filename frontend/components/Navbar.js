import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = (
    <>
      <Link href="/?category=tech" className="hover:text-white transition" onClick={() => setMenuOpen(false)}>Tech</Link>
      <Link href="/?category=food" className="hover:text-white transition" onClick={() => setMenuOpen(false)}>Food</Link>
      <Link href="/?category=fashion" className="hover:text-white transition" onClick={() => setMenuOpen(false)}>Fashion</Link>
      {user?.role === 'admin' && (
        <Link href="/admin" className="hover:text-cyan transition" onClick={() => setMenuOpen(false)}>Admin</Link>
      )}
      {user?.role === 'vendor' && (
        <Link href="/vendor/dashboard" className="hover:text-cyan transition" onClick={() => setMenuOpen(false)}>My store</Link>
      )}
      {(!user || user.role === 'customer') && (
        <Link href="/become-vendor" className="hover:text-cyan transition" onClick={() => setMenuOpen(false)}>Sell on Pepenaldo</Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 bg-bg/85 backdrop-blur border-b border-line">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="font-display font-bold text-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan shadow-[0_0_10px_#00E5FF]" />
          PEPENALDO
        </Link>

        <div className="hidden md:flex gap-8 text-sm uppercase tracking-wide text-gray-400">
          {navLinks}
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
              <Link href="/account" className="text-gray-400 hover:text-white transition">
                {user.name.split(' ')[0]}
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
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            className="md:hidden border border-line rounded-md px-2.5 py-1.5 hover:border-cyan transition"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="md:hidden flex flex-col gap-4 px-6 pb-5 text-sm uppercase tracking-wide text-gray-400 border-t border-line pt-4">
          {navLinks}
        </div>
      )}
    </header>
  );
}
