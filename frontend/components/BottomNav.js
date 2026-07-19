import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, LayoutGrid, Tag, Package, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
  const router = useRouter();
  const { user } = useAuth();

  const items = [
    { href: '/', label: 'Home', Icon: Home },
    { href: '/?showCategories=1', label: 'Categories', Icon: LayoutGrid },
    { href: '/deals', label: 'Deals', Icon: Tag },
    { href: user ? '/orders' : '/login', label: 'Orders', Icon: Package },
    { href: user ? '/account' : '/login', label: 'Profile', Icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-line flex justify-around py-2">
      {items.map(({ href, label, Icon }) => {
        const active = router.asPath === href || (href === '/' && router.pathname === '/' && !router.query.category);
        return (
          <Link
            key={label}
            href={href}
            className="flex flex-col items-center gap-1 px-3 py-1 text-[10px] font-mono uppercase tracking-wide"
            style={{ color: active ? '#A855F7' : '#9CA3AF' }}
          >
            <Icon size={20} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
