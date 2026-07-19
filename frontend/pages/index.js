import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ShieldCheck, BadgeCheck, LayoutGrid, Clock, Search, ImagePlus, Shirt, Pizza, Cpu } from 'lucide-react';
import { api } from '../lib/api';
import ProductCard from '../components/ProductCard';
import { iconForCategory } from '../lib/categoryIcons';

const trustBadges = [
  { Icon: ShieldCheck, title: 'Secure payments', sub: 'Powered by Paystack' },
  { Icon: BadgeCheck, title: 'Verified sellers', sub: 'Marked with a badge' },
  { Icon: LayoutGrid, title: 'Wide selection', sub: '15+ categories' },
  { Icon: Clock, title: 'Always open', sub: 'Shop anytime' },
];

const promoBanners = [
  { category: 'fashion', label: 'New Arrivals', title: 'Fresh Picks Just for You', cta: 'Shop Now', Icon: Shirt, from: '#4C1D95', to: '#7C3AED' },
  { category: 'food', label: 'Food Deals', title: 'Up to 30% Off', cta: 'Order Now', Icon: Pizza, from: '#92400E', to: '#D97706' },
  { category: 'tech', label: 'Tech Essentials', title: 'Upgrade Your Lifestyle', cta: 'Shop Now', Icon: Cpu, from: '#1E3A8A', to: '#2563EB' },
];

export default function Home() {
  const router = useRouter();
  const { category } = router.query;
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [heroImage, setHeroImage] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products/meta/categories').then((data) => setCategories(data.categories));
    api.get('/products?featured=true').then((data) => setFeatured(data.products.slice(0, 8)));
    api.get('/settings').then((data) => setHeroImage(data.settings.hero_image_url));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);

    api
      .get(`/products?${params.toString()}`)
      .then((data) => setProducts(data.products))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [category, search]);

  const visibleCategories = categories.slice(0, 7);
  const hasMoreCategories = categories.length > 7;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Hero */}
      <section
        className="mb-8 rounded-2xl p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center"
        style={{ background: 'linear-gradient(135deg, #2E1065 0%, #4C1D95 45%, #6D28D9 100%)' }}
      >
        <div>
          <p className="font-mono text-purple-200 text-sm mb-3">// ALL SYSTEMS OPERATIONAL</p>
          <h1 className="font-display font-bold text-4xl md:text-6xl leading-none text-white">
            Tech, food & fashion — <span className="text-purple-300">one cart.</span>
          </h1>
          <p className="text-purple-100/80 mt-4 max-w-lg">
            Explore products from verified sellers across {categories.length || '15+'} categories. Smart search, fast checkout.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <a
              href="#catalog"
              className="bg-white text-[#2E1065] font-display font-semibold uppercase tracking-wide px-6 py-2.5 rounded-md"
            >
              Shop now
            </a>
            <a
              href="#categories"
              className="border border-white/40 text-white font-display font-semibold uppercase tracking-wide px-6 py-2.5 rounded-md"
            >
              Explore categories
            </a>
          </div>
        </div>

        <div className="aspect-square md:aspect-[4/3] rounded-xl overflow-hidden flex items-center justify-center">
          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroImage} alt="Featured" className="w-full h-full object-cover rounded-xl" />
          ) : (
            <div className="w-full h-full border-2 border-dashed border-white/30 rounded-xl flex flex-col items-center justify-center gap-2 text-white/60">
              <ImagePlus size={32} />
              <p className="text-sm font-mono text-center px-6">
                Add a hero photo from Admin → Settings
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Trust badges */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {trustBadges.map(({ Icon, title, sub }) => (
          <div key={title} className="bg-surface border border-line rounded-xl p-4 flex items-center gap-3">
            <Icon size={20} className="text-cyan shrink-0" />
            <div>
              <p className="text-sm font-semibold leading-tight">{title}</p>
              <p className="text-xs text-gray-500">{sub}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Shop by category */}
      <section id="categories" className="mb-10 scroll-mt-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl">Shop by category</h2>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          <button
            onClick={() => router.push('/')}
            className="flex flex-col items-center gap-2 p-3 rounded-xl border transition"
            style={{
              backgroundColor: !category ? '#A855F7' : 'transparent',
              borderColor: !category ? '#A855F7' : undefined,
            }}
          >
            <LayoutGrid size={22} className={!category ? 'text-white' : 'text-gray-400'} />
            <span className={`text-xs ${!category ? 'text-white' : 'text-gray-400'}`}>All</span>
          </button>
          {visibleCategories.map((c) => {
            const Icon = iconForCategory(c.slug);
            const active = category === c.slug;
            return (
              <button
                key={c.id}
                onClick={() => router.push(`/?category=${c.slug}#catalog`)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border transition"
                style={{
                  backgroundColor: active ? '#A855F7' : 'transparent',
                  borderColor: active ? '#A855F7' : '#2E2650',
                }}
              >
                <Icon size={22} className={active ? 'text-white' : 'text-gray-400'} />
                <span className={`text-xs text-center leading-tight ${active ? 'text-white' : 'text-gray-400'}`}>
                  {c.name}
                </span>
              </button>
            );
          })}
          {hasMoreCategories && (
            <Link
              href="/deals#catalog"
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-line text-gray-400"
            >
              <span className="text-xl">•••</span>
              <span className="text-xs">More</span>
            </Link>
          )}
        </div>
      </section>

      {/* Featured deals — only real products with an actual discount or featured flag */}
      {featured.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-xl">Featured deals</h2>
            <Link href="/deals" className="text-cyan text-sm font-mono">View all →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Promo banners — real category links, icon art instead of stock photos */}
      <section className="grid md:grid-cols-3 gap-4 mb-10">
        {promoBanners.map(({ category: cat, label, title, cta, Icon, from, to }) => (
          <Link
            key={cat}
            href={`/?category=${cat}#catalog`}
            className="relative rounded-xl p-6 overflow-hidden flex flex-col justify-between min-h-[140px]"
            style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
          >
            <Icon size={90} className="absolute -right-4 -bottom-4 text-white/15" />
            <div>
              <p className="text-white/70 text-xs font-mono uppercase tracking-wide">{label}</p>
              <p className="text-white font-display font-bold text-lg mt-1">{title}</p>
            </div>
            <span className="bg-white text-sm font-display font-semibold uppercase tracking-wide px-4 py-2 rounded-md w-fit mt-4" style={{ color: from }}>
              {cta}
            </span>
          </Link>
        ))}
      </section>

      {/* Full catalog */}
      <section id="catalog" className="scroll-mt-20">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <h2 className="font-display font-bold text-xl mr-auto">All products</h2>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-surface border border-line rounded-md pl-9 pr-4 py-2 text-sm font-mono focus:outline-none focus:border-cyan"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500 font-mono text-sm">Loading catalog…</p>
        ) : products.length === 0 ? (
          <p className="text-gray-500 font-mono text-sm">No products match that search.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
