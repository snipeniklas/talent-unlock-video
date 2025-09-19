import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  type?: string;
  structuredData?: object;
}

export const SEOHead = ({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  type = 'website',
  structuredData
}: SEOHeadProps) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    const metaTags = [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: ogImage },
      { property: 'og:type', content: type },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: ogImage },
    ];

    metaTags.forEach(({ name, property, content }) => {
      if (content) {
        const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
        let meta = document.querySelector(selector) as HTMLMetaElement;
        
        if (!meta) {
          meta = document.createElement('meta');
          if (name) meta.setAttribute('name', name);
          if (property) meta.setAttribute('property', property);
          document.head.appendChild(meta);
        }
        
        meta.setAttribute('content', content);
      }
    });

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }

    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"][data-dynamic]') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute('data-dynamic', 'true');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }
  }, [title, description, keywords, canonical, ogImage, type, structuredData]);

  return null;
};

export default SEOHead;