import { Helmet } from 'react-helmet-async';
import { SITE_URL, SITE_NAME, DEFAULT_SEO } from '../config/seo';
import { useAppStore } from '../store/useAppStore';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  lang?: 'en' | 'tc';
}

export default function SEO({
  title,
  description,
  canonical = SITE_URL,
  ogImage = `${SITE_URL}og-image.png`,
  lang,
}: SEOProps) {
  const storeLang = useAppStore((s) => s.language);
  const effectiveLang = lang ?? (storeLang === 'TC' ? 'tc' : 'en');
  const defaults = DEFAULT_SEO[effectiveLang];

  const fullTitle = title ? `${title} | ${SITE_NAME}` : defaults.title;
  const metaDescription = description || defaults.description;

  const ogTitle = fullTitle;
  const ogDesc = metaDescription;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDesc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={effectiveLang === 'tc' ? 'zh_Hant_HK' : 'en_HK'} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDesc} />
      <meta name="twitter:image" content={ogImage} />

      {/* Language alternates */}
      <link rel="alternate" hrefLang="en" href={`${canonical}?lang=en`} />
      <link rel="alternate" hrefLang="zh-Hant" href={`${canonical}?lang=tc`} />
      <link rel="alternate" hrefLang="x-default" href={canonical} />
    </Helmet>
  );
}
