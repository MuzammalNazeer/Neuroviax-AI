import React, { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogType?: 'website' | 'article' | 'product' | 'profile';
  ogImage?: string;
  ogImageAlt?: string;
  noIndex?: boolean;
  structuredData?: Record<string, any> | Array<Record<string, any>>;
}

const DEFAULT_TITLE = 'Neuroviax AI — AI-First Autonomous Business Operating Platform';
const DEFAULT_DESCRIPTION =
  'Neuroviax AI is the first AI-powered Autonomous Business Operating Platform (ABOP) for SMEs in Pakistan, India & MENA. Automate inventory, orders, payments, procurement & CRM with 6 intelligent AI assistants.';
const DEFAULT_KEYWORDS =
  'Neuroviax AI, ABOP, autonomous business operating platform, AI inventory management, SME ERP, procurement AI, cash flow forecasting, order automation, Pakistan SME software, MENA enterprise AI';
const DEFAULT_IMAGE = 'https://neuroviax.ai/og-image.png';
const SITE_NAME = 'Neuroviax AI';
const BASE_URL = 'https://neuroviax.ai';

export const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonical,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  ogImageAlt = 'Neuroviax AI — Autonomous Business Operating Platform Dashboard',
  noIndex = false,
  structuredData,
}) => {
  useEffect(() => {
    // 1. Update Title
    const fullTitle = title
      ? title.includes(SITE_NAME)
        ? title
        : `${title} | ${SITE_NAME}`
      : DEFAULT_TITLE;
    document.title = fullTitle;

    // Helper to update or create a meta tag
    const setMetaTag = (selector: string, attrName: string, attrValue: string, content: string) => {
      let element = document.querySelector(selector) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Primary Meta Tags
    setMetaTag('meta[name="description"]', 'name', 'description', description);
    setMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords);
    setMetaTag(
      'meta[name="robots"]',
      'name',
      'robots',
      noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );
    setMetaTag('meta[name="googlebot"]', 'name', 'googlebot', noIndex ? 'noindex, nofollow' : 'index, follow');

    // 3. Canonical URL
    const currentUrl = canonical || (typeof window !== 'undefined' ? window.location.href.split('?')[0] : BASE_URL);
    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', currentUrl);

    // 4. OpenGraph Tags
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', currentUrl);
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);
    setMetaTag('meta[property="og:image:alt"]', 'property', 'og:image:alt', ogImageAlt);

    // 5. Twitter Card Tags
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);
    setMetaTag('meta[name="twitter:image:alt"]', 'name', 'twitter:image:alt', ogImageAlt);

    // 6. Dynamic JSON-LD Structured Data
    const scriptId = 'dynamic-page-schema';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (structuredData) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(structuredData);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    // Cleanup on unmount
    return () => {
      if (scriptTag && scriptTag.parentNode) {
        scriptTag.remove();
      }
    };
  }, [title, description, keywords, canonical, ogType, ogImage, ogImageAlt, noIndex, structuredData]);

  return null;
};

export default SEO;
