// Cookie consent state: what the visitor agreed to, stored in their browser.
//
// Categories:
//   necessary – login, cart, checkout/payment security. Always on (the site
//               can't work without them), so they never need consent.
//   analytics – visit statistics, e.g. Google Analytics.
//   marketing – advertising / retargeting, e.g. Facebook Pixel.
//
// Any code that loads a non-essential script must check hasConsent() first
// and listen for CONSENT_CHANGED_EVENT, so it starts as soon as the visitor
// accepts (and does nothing if they reject).

import { FEATURES } from '../config/features';

const STORAGE_KEY = 'cookie_consent_v1';

// Bump when the categories or their meaning change; visitors are asked again.
const CONSENT_VERSION = 1;

export const CONSENT_CHANGED_EVENT = 'cookie-consent-changed';
export const OPEN_SETTINGS_EVENT = 'open-cookie-settings';

export const CONSENT_CATEGORIES = [
  {
    key: 'necessary',
    title: 'Strictly necessary',
    description: 'Keep you logged in, remember your cart and secure checkout and payments. Always on.',
    locked: true,
  },
  {
    key: 'analytics',
    title: 'Analytics',
    description: 'Help us understand how visitors use the site so we can improve it.',
  },
  {
    key: 'marketing',
    title: 'Marketing',
    description: 'Used to show you relevant ads on other websites.',
  },
];

// Returns { necessary, analytics, marketing, version, updatedAt } or null if
// the visitor hasn't chosen yet (or chose under an older version).
export const getConsent = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.version === CONSENT_VERSION ? parsed : null;
  } catch {
    return null;
  }
};

export const saveConsent = ({ analytics = false, marketing = false }) => {
  const consent = {
    necessary: true,
    analytics: !!analytics,
    marketing: !!marketing,
    version: CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // Storage blocked (private mode etc.): the choice still applies this visit.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: consent }));
  return consent;
};

// True only if the visitor explicitly allowed this category.
// While the cookie consent feature is switched off, non-essential categories
// are always false, so trackers can't load without a banner to ask first.
export const hasConsent = (category) => {
  if (category === 'necessary') return true;
  if (!FEATURES.cookieConsent) return false;
  return !!getConsent()?.[category];
};

// Opens the cookie settings dialog from anywhere (e.g. the footer link).
export const openCookieSettings = () => {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
};
