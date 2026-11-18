# Google Analytics (GA4): integration plan for the storefront

This is a plan only. No analytics code exists yet. It covers what to set up, which choices to make, and where each piece would go in `client/`.

---

## 1. What we'd get

Google Analytics 4 (GA4) shows:

- **Traffic:** visitors, sessions, which pages they view, and where they came from (Google search, Instagram, ads ...).
- **Shop funnel:** how many visitors view a product, add it to the cart, start checkout and pay, and where they drop off.
- **Revenue:** sales per product, per traffic source and per country.

GA4 has a built-in **ecommerce** report. It fills in automatically if the site sends a fixed set of events (section 6).

---

## 2. Before writing code

| Step | Who | Notes |
|---|---|---|
| Create a Google Analytics account and a **GA4 property** for elmaghrib.com | Site owner | Use the business's Google account, not a personal one, so access survives staff changes. Time zone: Ireland. Currency: **EUR**. |
| Add a **Web data stream** for `https://elmaghrib.com` | Site owner | This produces the **Measurement ID** (`G-XXXXXXXXXX`), the only value the code needs. |
| Give the developer **Editor** access | Site owner | Admin → Property access management. |
| Set **data retention to 14 months** | Developer | Admin → Data collection → Data retention. The default is 2 months, which is too short for year-on-year comparisons. |
| Turn **off** Google Signals (for now) | Developer | It links visits to Google accounts for ads. Keep it off unless marketing needs it, because it raises the consent requirements. |
| Define **internal traffic** (office IPs) and filter it out | Developer | So staff browsing doesn't skew the numbers. |

---

## 3. Legal requirement: consent first

The business is registered in Ireland, so EU law (ePrivacy + GDPR) applies. GA4 sets cookies that are **not** strictly necessary, so:

1. **GA must not load until the visitor clicks "Accept" (or turns on Analytics).** Visitors who choose "Technical only" are not tracked at all.
2. The cookie banner must be live **before** GA goes live.
3. The **Privacy Policy** must name Google Analytics, what it collects and how long it's kept. The current page lists a Facebook Pixel that doesn't exist; fix that at the same time.

The banner is already built and switched off. Turning it on is step 1 of the rollout (section 8).

### Consent Mode

Google's **Consent Mode v2** tells Google tags what the visitor allowed. There are two options:

- **Basic (recommended):** the GA script isn't loaded at all until consent. This is the simplest option and the safest legally; the Irish regulator is strict on this.
- **Advanced:** GA loads for everyone but sends anonymous, cookie-free pings until consent, and Google estimates the missing data. You get more complete numbers, but it's harder to defend legally and to explain in the Privacy Policy.

**Plan: Basic mode.** We still send the Consent Mode signals (`analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization`), so Google Ads can be added later without rework.

---

## 4. How it plugs into the existing code

The pieces that already exist:

| Piece | File | Role for GA |
|---|---|---|
| Feature switch | [client/src/config/features.js](../client/src/config/features.js) | `cookieConsent: true` turns on the banner. |
| Consent state | [client/src/consent/cookieConsent.js](../client/src/consent/cookieConsent.js) | `hasConsent('analytics')` and the `cookie-consent-changed` event decide when GA may load. |
| Banner + settings | [client/src/components/CookieBanner.jsx](../client/src/components/CookieBanner.jsx) | Visitor's choice. The footer "Cookie settings" link reopens it. |

New pieces to add:

| New file / change | Purpose |
|---|---|
| `VITE_GA_MEASUREMENT_ID` in `client/.env.production` (and `.env.example`) | The `G-...` ID. **Leave it out of `.env.development`**, so local testing never pollutes real data. No ID → analytics stays off. |
| `client/src/analytics/analytics.js` | One small module that owns GA. It loads `gtag.js` only when there's an ID **and** `hasConsent('analytics')`, listens for `cookie-consent-changed` to start (or stop) GA when the visitor changes their mind, and exports `track(eventName, params)`. While GA isn't loaded, `track()` does nothing. The rest of the app never talks to Google directly. |
| `client/src/analytics/ecommerce.js` | Helpers that turn our cart/product objects into GA's item format (`item_id`, `item_name`, `item_variant`, `price`, `quantity`), so every event sends items the same way. |
| One-line calls in existing pages | `track('add_to_cart', ...)` and so on, at the points in section 6. |

**If a visitor withdraws consent:** stop sending events, set Consent Mode back to `denied`, and delete the `_ga` / `_ga_*` cookies.

---

## 5. Page views in a single-page app

The storefront is a React single-page app: changing page doesn't reload the browser, so GA only sees the first page unless told otherwise. There are two options, and **only one should be used** to avoid counting every page twice:

- **Option A (recommended):** rely on GA4's **Enhanced measurement → "Page changes based on browser history events"**, which is on by default and detects React Router navigation automatically. No code needed.
- **Option B:** turn that setting off and send `page_view` manually on every route change (a `useEffect` on `useLocation()` in `App.jsx`). Use this only if Option A miscounts.

---

## 6. Ecommerce events to send

These are GA4's standard names, so the built-in ecommerce reports fill in automatically. Currency is always `EUR`.

| GA4 event | When | Where in our code |
|---|---|---|
| `view_item_list` | A product list is shown | `ProductListing.jsx`, `BestSellers.jsx`, `Carousel.jsx` |
| `select_item` | A product card is clicked | `ProductCard.jsx` |
| `view_item` | Product page loads | `ProductDetail.jsx` (after `fetchProductById` succeeds) |
| `add_to_cart` | Item added (guest or logged in) | `addToCart` thunk in `redux/slices/cartSlice.js` |
| `remove_from_cart` | Item removed | `removeFromCart` thunk + the guest-cart removal in `Cart.jsx` / `CartDrawer.jsx` / `ItemsList.jsx` |
| `view_cart` | Cart page or drawer opened | `Cart.jsx`, `CartDrawer.jsx` |
| `begin_checkout` | Checkout page opened with items | `Checkout.jsx` |
| `add_shipping_info` | Country chosen and shipping fee loaded | `Checkout.jsx` |
| `add_payment_info` | Pay clicked, card accepted | `PaymentForm.jsx` |
| `purchase` | Order placed successfully | `Checkout.jsx`, after `placeOrder` returns an `orderId` |
| `sign_up` / `login` | Account created / logged in | `Signup.jsx` / `Login.jsx` |

**The `purchase` event must be sent exactly once per order.** It carries `transaction_id` = our `orderId`, `value` (total paid), `shipping`, `coupon` and `items`. GA ignores repeated `purchase` events with the same `transaction_id`, but we also guard it with the existing `sessionStorage.orderComplete` flag, so a refresh of the confirmation page can't resend it.

**Never send personal data to GA:** no names, emails, phone numbers or addresses in any event. This is against Google's terms and against GDPR. User IDs and order IDs are fine.

### Later, optional: server-side purchase

Some visitors block GA (ad blockers, Safari privacy features), so browser-only `purchase` events undercount sales. Later, the server could also send `purchase` from `checkoutController.js` using the GA4 **Measurement Protocol**, but only for visitors who consented (the client would pass the GA client ID with the checkout payload). Not needed for the first version.

---

## 7. What stays out of scope

- **Admin panel:** no analytics. It's internal, and tracking staff would skew the numbers.
- **Google Tag Manager:** not needed for one tool. Worth considering only if marketing will later manage several tags (Facebook Pixel, Google Ads, TikTok) without a developer. GTM then replaces `analytics.js`, but the consent logic stays the same.

---

## 8. Rollout plan

| # | Step | Done when |
|---|---|---|
| 1 | Owner creates the GA4 property and sends the Measurement ID (section 2) | `G-...` ID received |
| 2 | Update the Privacy Policy (Google Analytics: purpose, data, 14-month retention, how to withdraw consent; remove the non-existent Facebook Pixel line). It's editable in Admin → Pages | Policy published |
| 3 | Set `cookieConsent: true` in `features.js` | Banner shows on first visit; choice is remembered; footer link reopens it |
| 4 | Add `VITE_GA_MEASUREMENT_ID` to `.env.production` and `.env.example`; build `analytics/analytics.js` and `analytics/ecommerce.js` | GA loads only after Accept; nothing loads after "Technical only" |
| 5 | Add the event calls from section 6 | All events visible in GA **DebugView** |
| 6 | Test (section 9), then build and deploy | Checklist passes on the live site |
| 7 | In GA: mark `purchase` as a **key event**, set internal-traffic filter to *Active*, check the ecommerce report after 24–48 h | Revenue in GA roughly matches orders in the admin |

## 9. Test checklist

- [ ] First visit: banner shows, and **no** requests to `googletagmanager.com` / `google-analytics.com` in DevTools → Network.
- [ ] "Technical only": still no Google requests, even after browsing and buying.
- [ ] "Accept all": `gtag.js` loads and `_ga` cookies appear.
- [ ] Withdraw via footer "Cookie settings": tracking stops and `_ga` cookies are removed.
- [ ] Each event in section 6 appears in GA → Admin → **DebugView** (use the Google **Tag Assistant** browser extension to enable debug mode) with correct items, prices and EUR.
- [ ] One test purchase produces exactly **one** `purchase` with the right `transaction_id` and total, including after refreshing the confirmation page.
- [ ] Navigating between pages counts each page view once (section 5).
- [ ] No names, emails or addresses in any event payload.
- [ ] Local dev (`npm run dev`) sends nothing (no Measurement ID in `.env.development`).
