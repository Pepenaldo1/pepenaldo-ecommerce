import Head from 'next/head';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pepenaldo-ecommerce.vercel.app';
const SITE_NAME = 'Pepenaldo';
const DEFAULT_DESCRIPTION =
  'Shop tech, food, fashion, and more from verified sellers on Pepenaldo — one cart, real reviews, secure checkout.';

export default function Seo({ title, description = DEFAULT_DESCRIPTION, path = '', image }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Tech, food & fashion, one cart`;
  const url = `${SITE_URL}${path}`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph — how the page looks when shared on WhatsApp, Facebook, etc. */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter/X card */}
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
  );
}
