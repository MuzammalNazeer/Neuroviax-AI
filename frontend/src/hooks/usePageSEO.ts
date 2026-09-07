import { useEffect } from 'react';

interface SEOConfig {
  title: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  noIndex?: boolean;
}

const BASE_TITLE = 'Neuroviax AI';

/**
 * Dynamic per-page SEO hook.
 * Updates document title and meta tags on each page navigation.
 */
export function usePageSEO(config: SEOConfig) {
  useEffect(() => {
    // ── Title ──────────────────────────────────────────
    const fullTitle = config.title === BASE_TITLE
      ? `${BASE_TITLE} — AI-First Autonomous Business Operating Platform`
      : `${config.title} | ${BASE_TITLE}`;
    document.title = fullTitle;

    // ── Meta Description ──────────────────────────────
    if (config.description) {
      setMeta('description', config.description);
    }

    // ── Canonical URL ─────────────────────────────────
    if (config.canonical) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (link) {
        link.href = config.canonical;
      } else {
        link = document.createElement('link');
        link.rel = 'canonical';
        link.href = config.canonical;
        document.head.appendChild(link);
      }
    }

    // ── Open Graph ────────────────────────────────────
    setMeta('og:title', config.ogTitle || fullTitle, 'property');
    if (config.ogDescription || config.description) {
      setMeta('og:description', config.ogDescription || config.description || '', 'property');
    }

    // ── Robots ────────────────────────────────────────
    if (config.noIndex) {
      setMeta('robots', 'noindex, nofollow');
    } else {
      const robotsMeta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
      if (robotsMeta && robotsMeta.content === 'noindex, nofollow') {
        robotsMeta.content = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
      }
    }

    // Cleanup: restore base title on unmount
    return () => {
      document.title = `${BASE_TITLE} — AI-First Autonomous Business Operating Platform`;
    };
  }, [config.title, config.description, config.canonical, config.ogTitle, config.ogDescription, config.noIndex]);
}

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let meta = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (meta) {
    meta.content = content;
  } else {
    meta = document.createElement('meta');
    meta.setAttribute(attr, name);
    meta.content = content;
    document.head.appendChild(meta);
  }
}

export default usePageSEO;
