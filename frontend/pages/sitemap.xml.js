const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pepenaldo-ecommerce.vercel.app';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function buildSitemap(staticPaths, products) {
  const urls = [
    ...staticPaths.map((path) => `<url><loc>${SITE_URL}${path}</loc></url>`),
    ...products.map(
      (p) => `<url><loc>${SITE_URL}/product/${p.id}</loc><lastmod>${new Date(p.updated_at || p.created_at).toISOString()}</lastmod></url>`
    ),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

export default function Sitemap() {
  // This component renders nothing — getServerSideProps writes the XML response directly.
  return null;
}

export async function getServerSideProps({ res }) {
  let products = [];
  try {
    const response = await fetch(`${API_URL}/products`);
    const data = await response.json();
    products = data.products || [];
  } catch {
    products = [];
  }

  const staticPaths = ['/', '/deals', '/new-arrivals', '/best-sellers', '/help-center'];
  const xml = buildSitemap(staticPaths, products);

  res.setHeader('Content-Type', 'text/xml');
  res.write(xml);
  res.end();

  return { props: {} };
}
