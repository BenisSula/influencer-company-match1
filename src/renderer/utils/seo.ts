/**
 * SEO Utilities for Landing Page
 * Manages meta tags, structured data, and SEO optimization
 */

export interface MetaTag {
  name?: string;
  property?: string;
  content: string;
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

/**
 * Update document meta tags
 */
export const updateMetaTags = (tags: MetaTag[]): void => {
  tags.forEach(tag => {
    const attribute = tag.name ? 'name' : 'property';
    const value = tag.name || tag.property;
    
    let meta = document.querySelector(`meta[${attribute}="${value}"]`);
    
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attribute, value!);
      document.head.appendChild(meta);
    }
    
    meta.setAttribute('content', tag.content);
  });
};

/**
 * Update document title
 */
export const updateTitle = (title: string): void => {
  document.title = title;
};

/**
 * Add structured data (JSON-LD) to page
 */
export const addStructuredData = (data: StructuredData): void => {
  const scriptId = 'structured-data';
  let script = document.getElementById(scriptId);
  
  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    (script as HTMLScriptElement).type = 'application/ld+json';
    document.head.appendChild(script);
  }
  
  script.textContent = JSON.stringify(data);
};

/**
 * Remove structured data from page
 */
export const removeStructuredData = (): void => {
  const script = document.getElementById('structured-data');
  if (script) {
    script.remove();
  }
};

/**
 * Landing page SEO configuration
 */
export const landingSEO = {
  title: 'ICMatch - AI-Powered Influencer Marketing Platform | Connect Brands with Influencers',
  
  description: 'Join 10,000+ influencers and brands creating successful collaborations through AI-powered matching. 93% accuracy rate, $5M+ in partnerships. Start free today.',
  
  keywords: [
    'influencer marketing',
    'brand partnerships',
    'AI matching',
    'influencer platform',
    'brand collaborations',
    'social media marketing',
    'content creator platform',
    'influencer marketplace'
  ].join(', '),
  
  metaTags: [
    // Basic Meta Tags
    {
      name: 'description',
      content: 'Join 10,000+ influencers and brands creating successful collaborations through AI-powered matching. 93% accuracy rate, $5M+ in partnerships. Start free today.'
    },
    {
      name: 'keywords',
      content: 'influencer marketing, brand partnerships, AI matching, influencer platform, brand collaborations'
    },
    {
      name: 'author',
      content: 'ICMatch'
    },
    {
      name: 'robots',
      content: 'index, follow'
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1.0'
    },
    
    // Open Graph Tags (Facebook, LinkedIn)
    {
      property: 'og:type',
      content: 'website'
    },
    {
      property: 'og:site_name',
      content: 'ICMatch'
    },
    {
      property: 'og:title',
      content: 'ICMatch - AI-Powered Influencer Marketing Platform'
    },
    {
      property: 'og:description',
      content: 'Connect influencers with brands through AI-powered matching. Join 10,000+ active users creating successful collaborations.'
    },
    {
      property: 'og:image',
      content: '/og-image.jpg'
    },
    {
      property: 'og:image:width',
      content: '1200'
    },
    {
      property: 'og:image:height',
      content: '630'
    },
    {
      property: 'og:url',
      content: 'https://icmatch.com'
    },
    {
      property: 'og:locale',
      content: 'en_US'
    },
    
    // Twitter Card Tags
    {
      name: 'twitter:card',
      content: 'summary_large_image'
    },
    {
      name: 'twitter:site',
      content: '@ICMatch'
    },
    {
      name: 'twitter:creator',
      content: '@ICMatch'
    },
    {
      name: 'twitter:title',
      content: 'ICMatch - AI-Powered Influencer Marketing Platform'
    },
    {
      name: 'twitter:description',
      content: 'Connect influencers with brands through AI-powered matching. 93% success rate, 10,000+ active users.'
    },
    {
      name: 'twitter:image',
      content: '/twitter-card.jpg'
    },
    
    // Mobile App Tags
    {
      name: 'apple-mobile-web-app-capable',
      content: 'yes'
    },
    {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'black-translucent'
    },
    {
      name: 'apple-mobile-web-app-title',
      content: 'ICMatch'
    },
    {
      name: 'mobile-web-app-capable',
      content: 'yes'
    },
    
    // Theme Color (Instagram Pink)
    {
      name: 'theme-color',
      content: '#E1306C'
    },
    {
      name: 'msapplication-TileColor',
      content: '#E1306C'
    }
  ],
  
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ICMatch',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
      bestRating: '5',
      worstRating: '1'
    },
    description: 'AI-powered platform connecting influencers with brands for successful marketing collaborations',
    image: 'https://icmatch.com/app-icon.png',
    url: 'https://icmatch.com',
    author: {
      '@type': 'Organization',
      name: 'ICMatch',
      url: 'https://icmatch.com'
    },
    publisher: {
      '@type': 'Organization',
      name: 'ICMatch',
      logo: {
        '@type': 'ImageObject',
        url: 'https://icmatch.com/logo.png'
      }
    },
    datePublished: '2024-01-01',
    dateModified: new Date().toISOString().split('T')[0]
  }
};

/**
 * Apply landing page SEO
 */
export const applyLandingSEO = (): void => {
  updateTitle(landingSEO.title);
  updateMetaTags(landingSEO.metaTags);
  addStructuredData(landingSEO.structuredData);
};

/**
 * Clean up SEO tags (for SPA navigation)
 */
export const cleanupSEO = (): void => {
  removeStructuredData();
};
