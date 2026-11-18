// ─────────────────────────────────────────────────────────────────────────────
// Feature switches for the storefront.
//
// Flip a value to `true` and rebuild (npm run build) to turn a feature on.
// While a switch is `false`, the feature is completely inactive: nothing is
// rendered, nothing is stored, and no styles are applied.
// ─────────────────────────────────────────────────────────────────────────────

export const FEATURES = {
  // Cookie consent banner + "Cookie settings" link in the footer.
  // Turn on before adding any non-essential tracking (Google Analytics,
  // Facebook Pixel, ...). See docs/google-analytics-plan.md.
  cookieConsent: false,

  // Light/dark theme toggle (sun/moon button in the header). The first visit
  // follows the device setting; the visitor's choice is remembered.
  darkMode: false,
};
