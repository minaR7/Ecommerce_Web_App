import { useState, useEffect } from 'react';
import axios from 'axios';

// Built-in defaults so the homepage renders fully and INSTANTLY on the very
// first visit — even before (or without) any response from the backend.
export const SETTINGS_DEFAULTS = {
  logo_url: null,
  hero_image_url: null,
  intro_image_url: null,
  hero_eyebrow:    'Authentic Moroccan Craftsmanship',
  hero_heading:    'Jabador & Moroccan Thobes Online',
  hero_subheading: 'High-quality traditional fashion, handcrafted for every occasion.',
  hero_cta_text:   'Shop Collection',
  hero_cta_link:   '/store',
  intro_eyebrow:   'Our Story',
  intro_heading:   'Tradition woven into every thread',
  intro_text:      'Since 2009, JABADOR offers you the sale of traditional Moroccan dress such as the Jabador, Djellaba and Gandoura at a price everyone can afford, working with experienced Moroccan craftsmen. Our challenge is to give you the opportunity to buy a wide range of Moroccan clothes for all occasions (Muslim religious holidays, weddings, Hlal) in quality fabrics, linen, Mlifa (cotton), Gabardine and Velvet.',
  footer_description: 'Our shop offers classy and modern Moroccan outfits made with passion in our workshops in Morocco.',
  footer_need_help_text: 'Monday to Sunday from 9 a.m. to 6 p.m.',
  footer_whatsapp: '',
  footer_email: 'support@jabador.com',
  footer_phone: '',
  footer_instagram: '',
  footer_facebook: '',
  footer_linkedin: '',
  footer_copyright: `© ${new Date().getFullYear()} Jabador - All rights reserved`,
  // Product detail info block — bundled into the build so the product page always
  // renders these even if the backend is unreachable (build-time config fallback).
  product_shipping_charges: 'Free shipping on all orders.',
  product_collection: 'Click & Collect - Select store at checkout.',
  product_postage: 'Free delivery in 2-3 days',
  product_returns: '30 days return. Seller pays for return postage.',
  // Accepted payment methods shown as icons on the product page. Bundled defaults
  // point at local /assets icons so they render even if the backend is unreachable.
  payment_methods: [
    { name: 'Visa', icon_url: '/assets/icons/visa-svgrepo-com (1).svg' },
    { name: 'Mastercard', icon_url: '/assets/icons/mastercard-svgrepo-com.svg' },
  ],
};

const CACHE_KEY = 'site_settings_v1';
const API_BASE  = import.meta.env.VITE_BACKEND_SERVER_URL || '';

// Read any previously-cached settings synchronously (instant on repeat visits).
const readCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Module-level cache so multiple components share one fetch per session.
let cachedSettings = readCache();
let pendingPromise = null;

const fetchSettings = () => {
  if (!pendingPromise) {
    // Plain axios (NOT the shared instance) with a short timeout: never blocks
    // the UI and never triggers the global network-error toast.
    // Calls /public which only returns the storefront-facing fields — internal
    // settings like default_intl_shipping_fee are not included here (they're
    // served only via the protected admin GET /api/site-settings endpoint).
    pendingPromise = axios
      .get(`${API_BASE}/api/site-settings/public`, { timeout: 6000 })
      .then((res) => {
        cachedSettings = res.data;
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(res.data)); } catch {}
        return res.data;
      })
      .catch(() => cachedSettings) // keep cache/defaults silently on failure
      .finally(() => { pendingPromise = null; });
  }
  return pendingPromise;
};

export const useSiteSettings = () => {
  // Start from cache (or null) — merged with defaults below so it's always full.
  const [settings, setSettings] = useState(cachedSettings);
  const [loading, setLoading]   = useState(!cachedSettings);

  useEffect(() => {
    let active = true;
    fetchSettings().then((data) => {
      if (!active) return;
      if (data) setSettings(data);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  // Always return a complete object: defaults < cached/fetched.
  return { settings: { ...SETTINGS_DEFAULTS, ...(settings || {}) }, loading };
};
