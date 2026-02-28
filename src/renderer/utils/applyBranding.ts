export interface BrandingSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  successColor?: string;
  warningColor?: string;
  infoColor?: string;
  fontFamily: string;
  platformName: string;
  logo?: string;
  favicon?: string;
  customCSS?: string;
  tagline?: string;
  footerText?: string;
}

/**
 * Apply tenant-specific branding to the application
 * This function dynamically updates CSS variables, favicon, title, and custom styles
 */
export const applyBranding = (branding: BrandingSettings) => {
  const root = document.documentElement;
  
  // Apply color scheme - these CSS variables are used throughout the app
  root.style.setProperty('--primary-color', branding.primaryColor);
  root.style.setProperty('--secondary-color', branding.secondaryColor);
  root.style.setProperty('--accent-color', branding.accentColor);
  
  // Optional colors with fallbacks
  if (branding.successColor) {
    root.style.setProperty('--success-color', branding.successColor);
  }
  if (branding.warningColor) {
    root.style.setProperty('--warning-color', branding.warningColor);
  }
  if (branding.infoColor) {
    root.style.setProperty('--info-color', branding.infoColor);
  }
  
  // Apply font family
  if (branding.fontFamily) {
    root.style.setProperty('--font-family', branding.fontFamily);
    document.body.style.fontFamily = branding.fontFamily;
  }
  
  // Apply custom CSS if provided
  if (branding.customCSS) {
    const existingStyle = document.getElementById('tenant-custom-css');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    const style = document.createElement('style');
    style.id = 'tenant-custom-css';
    style.innerHTML = branding.customCSS;
    document.head.appendChild(style);
  }
  
  // Update favicon
  if (branding.favicon) {
    updateFavicon(branding.favicon);
  }
  
  // Update page title
  if (branding.platformName) {
    document.title = branding.platformName;
    
    // Also update meta tags for better SEO
    updateMetaTag('og:site_name', branding.platformName);
    updateMetaTag('application-name', branding.platformName);
  }
  
  // Update tagline in meta description if provided
  if (branding.tagline) {
    updateMetaTag('description', branding.tagline);
    updateMetaTag('og:description', branding.tagline);
  }
  
  // Store branding in localStorage for quick access on reload
  try {
    localStorage.setItem('tenant-branding', JSON.stringify(branding));
  } catch (e) {
    console.warn('Failed to cache branding settings');
  }
};

/**
 * Update or create a meta tag
 */
const updateMetaTag = (name: string, content: string) => {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
  if (!meta) {
    meta = document.querySelector(`meta[property="${name}"]`) as HTMLMetaElement;
  }
  
  if (meta) {
    meta.content = content;
  } else {
    meta = document.createElement('meta');
    meta.setAttribute(name.startsWith('og:') ? 'property' : 'name', name);
    meta.content = content;
    document.head.appendChild(meta);
  }
};

/**
 * Update favicon with multiple sizes for better browser support
 */
const updateFavicon = (faviconUrl: string) => {
  // Remove existing favicons
  const existingIcons = document.querySelectorAll("link[rel*='icon']");
  existingIcons.forEach(icon => icon.remove());
  
  // Add new favicon
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/x-icon';
  link.href = faviconUrl;
  document.head.appendChild(link);
  
  // Add apple touch icon
  const appleLink = document.createElement('link');
  appleLink.rel = 'apple-touch-icon';
  appleLink.href = faviconUrl;
  document.head.appendChild(appleLink);
};

/**
 * Load cached branding from localStorage for instant application
 * This prevents flash of unstyled content while fetching from API
 */
export const loadCachedBranding = (): BrandingSettings | null => {
  try {
    const cached = localStorage.getItem('tenant-branding');
    if (cached) {
      const branding = JSON.parse(cached);
      applyBranding(branding);
      return branding;
    }
  } catch (e) {
    console.warn('Failed to load cached branding');
  }
  return null;
};

/**
 * Get current tenant ID from subdomain or header
 * For development, defaults to 'default'
 */
export const getCurrentTenantId = (): string => {
  // Check for tenant in URL subdomain
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // If subdomain exists and it's not 'www' or 'localhost'
  if (parts.length > 2 && parts[0] !== 'www') {
    return parts[0];
  }
  
  // Check localStorage for dev/testing
  const storedTenant = localStorage.getItem('current-tenant-id');
  if (storedTenant) {
    return storedTenant;
  }
  
  return 'default';
};

/**
 * Set current tenant (for development/testing)
 */
export const setCurrentTenant = (tenantId: string) => {
  localStorage.setItem('current-tenant-id', tenantId);
  // Reload to apply new tenant branding
  window.location.reload();
};
