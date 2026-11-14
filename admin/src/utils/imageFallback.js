// Global safety net for broken <img> elements (logo, banners, product photos,
// antd <Image>, payment icons…). Covers every image without editing each component.
//
// Ordering matters: several components already have their own onError that swaps
// to a local /assets fallback (ProductCard, Home). Those run synchronously during
// the error event, so we wait one tick and only step in if the component did NOT
// change the src. If its own fallback also fails, the next error event finds the
// src unchanged and we swap in an inline placeholder — which can't fail, so this
// can never loop.

const svg = (body) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" ${body}</svg>`
  )}`;

// Text wordmark used when a logo image is missing. Colour follows the logo
// variant that failed (…-White.png on dark backgrounds → white text).
const logoPlaceholder = (fill) => svg(
  `viewBox="0 0 420 80" width="420" height="80">` +
  `<text x="210" y="52" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" ` +
  `font-size="40" font-weight="700" letter-spacing="6" fill="${fill}">EL MAGHRIB</text>`
);
const LOGO_DARK = logoPlaceholder('#222');
const LOGO_LIGHT = logoPlaceholder('#fff');

// Neutral picture placeholder for everything else.
const IMAGE_PLACEHOLDER = svg(
  `viewBox="-200 -200 800 800" preserveAspectRatio="xMidYMid slice">` +
  `<rect x="-2000" y="-2000" width="4400" height="4400" fill="#f0f0ee"/>` +
  `<g fill="none" stroke="#c8c8c4" stroke-width="10" stroke-linejoin="round">` +
  `<rect x="110" y="130" width="180" height="140" rx="12"/>` +
  `<path d="M120 255l50-55 40 40 30-30 40 45"/></g>` +
  `<circle cx="245" cy="170" r="14" fill="#c8c8c4"/>`
);

const isLogo = (img) =>
  /logo/i.test(img.getAttribute('src') || '') || /logo|el-?maghrib/i.test(img.alt || '');

let installed = false;

export function installImageFallback() {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  window.addEventListener(
    'error',
    (e) => {
      const img = e.target;
      if (!(img instanceof HTMLImageElement)) return;
      // img.src (not currentSrc) — it reflects a component's src change immediately,
      // whereas currentSrc only updates once the new request starts.
      const failedSrc = img.src;
      if (!failedSrc || failedSrc.startsWith('data:')) return;

      setTimeout(() => {
        // A component's own onError already handled it (src changed) — leave it alone.
        if (img.src !== failedSrc) return;
        if (img.srcset) img.removeAttribute('srcset');
        img.src = !isLogo(img)
          ? IMAGE_PLACEHOLDER
          : /white/i.test(failedSrc) ? LOGO_LIGHT : LOGO_DARK;
      }, 0);
    },
    true // capture: image load errors don't bubble
  );
}
