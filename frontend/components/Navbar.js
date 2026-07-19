import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LayoutGrid, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../lib/api';
import { iconForCategory } from '../lib/categoryIcons';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/products/meta/categories').then((data) => setCategories(data.categories)).catch(() => {});
  }, []);

  const roleLinks = (
    <>
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

  const secondaryLinks = [
    { href: '/', label: 'Home' },
    { href: '/deals', label: 'Deals' },
    { href: '/new-arrivals', label: 'New Arrivals' },
    { href: '/best-sellers', label: 'Best Sellers' },
    { href: user ? '/orders' : '/login', label: 'Track Order' },
    { href: '/help-center', label: 'Help Center' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-bg/85 backdrop-blur border-b border-line">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="font-display font-bold text-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan shadow-[0_0_10px_#A855F7]" />
          PEPENALDO
        </Link>

        <div className="flex items-center gap-4 font-mono text-sm">
          <Link href="/cart" className="border border-line rounded-md px-3 py-1.5 hover:border-cyan transition">
            CART <span className="bg-cyan text-bg font-bold rounded px-1.5 ml-1">{count}</span>
          </Link>
          {user ? (
            <>
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

      {/* Secondary row: All Categories dropdown + quick links */}
      <div className="hidden md:flex items-center gap-6 max-w-6xl mx-auto px-6 pb-3 text-sm text-gray-400 relative">
        <button
          onClick={() => setCategoriesOpen((v) => !v)}
          className="flex items-center gap-2 border border-line rounded-md px-3 py-1.5 hover:border-cyan transition"
        >
          <LayoutGrid size={14} />
          All Categories
          <ChevronDown size={14} />
        </button>
        {secondaryLinks.map((l) => (
          <Link key={l.label} href={l.href} className="hover:text-white transition">
            {l.label}
          </Link>
        ))}
        <div className="ml-auto flex gap-6">{roleLinks}</div>

        {categoriesOpen && (
          <div className="absolute top-full left-6 mt-1 bg-surface border border-line rounded-xl p-3 grid grid-cols-3 gap-2 z-50 w-80">
            {categories.map((c) => {
              const Icon = iconForCategory(c.slug);
              return (
                <Link
                  key={c.id}
                  href={`/?category=${c.slug}#catalog`}
                  onClick={() => setCategoriesOpen(false)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-bg text-xs text-gray-300"
                >
                  <Icon size={14} className="text-cyan shrink-0" />
                  {c.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {menuOpen && (
        <div className="md:hidden flex flex-col gap-4 px-6 pb-5 text-sm uppercase tracking-wide text-gray-400 border-t border-line pt-4">
          {secondaryLinks.map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</Link>
          ))}
          {roleLinks}
        </div>
      )}
    </header>
  );
}
