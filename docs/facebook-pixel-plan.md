# Facebook (Meta) Pixel: integration plan for the storefront

This is a plan only. No Pixel code exists yet. It covers what to set up, which choices to make, and where each piece would go in `client/` (and later `server/`).

It follows the same approach as the [Google Analytics plan](google-analytics-plan.md), and both use the same cookie consent banner. If both are being added, do them together: the consent work and the event points are shared.

---

## 1. What we'd get

The Meta Pixel connects the website to Facebook and Instagram advertising:

- **Ad results:** which ads lead to purchases, and the real return on ad spend (ROAS).
- **Better ad delivery:** Meta learns who buys and shows ads to similar people.
- **Retargeting:** show ads to people who viewed a product or left items in the cart.
- **Audiences:** for example "visited in the last 30 days" or "bought before" (to exclude or upsell).

It only pays off **if the business runs or plans to run Facebook/Instagram ads**. Without ads, Google Analytics alone answers the traffic and sales questions.

---

## 2. Before writing code

| Step | Who | Notes |
|---|---|---|
| Create (or use) a **Meta Business portfolio** at business.facebook.com | Site owner | Owned by the business, not a personal profile. |
| In **Events Manager**, create a **Dataset / Pixel** for elmaghrib.com | Site owner | This gives the **Pixel ID**, a number like `123456789012345`, which is the only value the browser code needs. |
| **Verify the domain** `elmaghrib.com` | Site owner + developer | Business settings → Brand safety → Domains. Usually a DNS TXT record in Plesk. It proves the business owns the site, and Meta needs it for reliable conversion reporting. |
| Give the developer access to the Pixel | Site owner | Business settings → Data sources → Datasets → Assign people. |
| Agree whether **Conversions API** (section 7) is in the first version | Owner + developer | Recommended, but it needs a server token. |

---

## 3. Legal requirement: consent first

The business is in Ireland, so EU law (ePrivacy + GDPR) applies. The Pixel is **marketing tracking**. It shares visitor behaviour with Meta for advertising, so it is never "strictly necessary".

1. **The Pixel must not load until the visitor allows Marketing**, through "Accept all" or by turning on Marketing in Cookie settings. "Technical only" or Analytics-only means **no Pixel**.
2. The cookie banner must be live **before** the Pixel goes live.
3. **Shared responsibility:** under EU case law (*Fashion ID*, CJEU 2019), the website and Meta are **joint controllers** for the data the Pixel collects. The site is therefore responsible for getting consent and for informing visitors.
4. The **Privacy Policy** must name Meta Pixel and describe it: purpose (advertising and measuring ads), data shared (pages viewed, cart and purchase events, device and browser data), that data goes to Meta Platforms Ireland and may be transferred to the US (Meta is certified under the EU–US Data Privacy Framework), and how to withdraw consent. The current policy already mentions "Facebook Pixel", although the site doesn't use one yet. Keep that line only when the Pixel actually goes live.
5. **Ad blockers and iOS privacy features** block many Pixel requests. That's expected and fine; don't try to work around them.

---

## 4. How it plugs into the existing code

The pieces that already exist:

| Piece | File | Role for the Pixel |
|---|---|---|
| Feature switch | [client/src/config/features.js](../client/src/config/features.js) | `cookieConsent: true` turns on the banner. |
| Consent state | [client/src/consent/cookieConsent.js](../client/src/consent/cookieConsent.js) | `hasConsent('marketing')` and the `cookie-consent-changed` event decide when the Pixel may load. |
| Banner + settings | [client/src/components/CookieBanner.jsx](../client/src/components/CookieBanner.jsx) | Visitor's choice, including the separate **Marketing** switch. |

New pieces to add:

| New file / change | Purpose |
|---|---|
| `VITE_META_PIXEL_ID` in `client/.env.production` (and `.env.example`) | The Pixel ID. **Leave it out of `.env.development`**, so local testing never sends fake purchases to Meta and confuses ad optimisation. No ID → Pixel stays off. |
| `client/src/analytics/metaPixel.js` | One small module that owns the Pixel. It loads Meta's `fbevents.js` only when there's an ID **and** `hasConsent('marketing')`, and listens for `cookie-consent-changed` to start, or to call `fbq('consent', 'revoke')` when consent is withdrawn. It exports `trackMeta(eventName, params, eventId)`. While the Pixel isn't loaded, that function does nothing. |
| Shared event helper (if GA is added too) | One `trackEcommerce('add_to_cart', data)` call per action that forwards to both GA and the Pixel, each with its own event names. Pages then don't need two calls everywhere. |
| One-line calls in existing pages | At the points in section 6. |

**If a visitor withdraws consent:** call `fbq('consent', 'revoke')`, stop sending events, and delete the `_fbp` / `_fbc` cookies.

---

## 5. Page views in a single-page app

The storefront is a React single-page app, so page changes don't reload the browser. The Pixel's standard code fires `PageView` on load, and by default it also detects in-app navigation through browser history. Plan:

1. Install the standard snippet (which fires the first `PageView`).
2. In Events Manager → **Test events**, browse a few pages and check that each page change produces **exactly one** `PageView`.
3. Only if page changes are missing, send `PageView` manually on route change (a `useEffect` on `useLocation()` in `App.jsx`). Never use both methods at once.

---

## 6. Events to send

Meta's standard event names, so they work with ad optimisation and the built-in reports. Currency is always `EUR`. `content_ids` are our product IDs, and they must match the IDs in a product catalog if one is added later (section 8).

| Meta event | When | Where in our code | Key parameters |
|---|---|---|---|
| `PageView` | Every page | Automatic (section 5) | — |
| `ViewContent` | Product page loads | `ProductDetail.jsx` | `content_ids`, `content_type: 'product'`, `value`, `currency` |
| `Search` | Product search | Header search (`productSlice.getSearchProduct`) | `search_string` |
| `AddToCart` | Item added (guest or logged in) | `addToCart` thunk in `redux/slices/cartSlice.js` | `content_ids`, `contents` (id + quantity), `value`, `currency` |
| `InitiateCheckout` | Checkout page opened with items | `Checkout.jsx` | `content_ids`, `contents`, `num_items`, `value`, `currency` |
| `AddPaymentInfo` | Pay clicked, card accepted | `PaymentForm.jsx` | `value`, `currency` |
| `Purchase` | Order placed successfully | `Checkout.jsx`, after `placeOrder` returns an `orderId` | `content_ids`, `contents`, `num_items`, `value` (total paid), `currency` |
| `CompleteRegistration` | Account created | `Signup.jsx` | — |

**`Purchase` must fire exactly once per order.** Use the existing `sessionStorage.orderComplete` flag, so a refresh of the confirmation page can't resend it. Also pass `eventID: 'order-<orderId>'` so Meta can de-duplicate it, which is required if Conversions API is added (section 7).

**Never put personal data in event parameters:** no names, emails, phones or addresses. See "Advanced Matching" below for the one controlled exception.

### Advanced Matching (decide later)

Advanced Matching sends a **hashed** email or phone number with events, so Meta can match more purchases to ad clicks. It improves ad reporting, but it is personal data shared with Meta for advertising. **Plan: off in the first version.** If marketing wants it later, it needs explicit mention in the Privacy Policy and must only run with Marketing consent.

---

## 7. Conversions API (server-side purchases): recommended second step

Browser-only tracking misses a noticeable share of purchases (ad blockers, Safari/iOS limits). Meta's **Conversions API (CAPI)** lets our **server** report purchases directly, which makes ad reporting much more accurate.

How it would fit:

1. Create a **CAPI access token** in Events Manager. It's a secret, so it goes only in the **server** env (`META_PIXEL_ID`, `META_CAPI_TOKEN`), never in the client.
2. At checkout, the client sends along its consent status, the `_fbp` / `_fbc` cookie values, and the same `event_id` it used for the browser `Purchase`.
3. In `server/controllers/checkoutController.js`, after the order is saved (next to the existing `order_created` notification), the server sends `Purchase` to CAPI **only if the visitor had Marketing consent**. It uses the same `event_id`, so Meta counts the order once, not twice.
4. Send it as a best-effort step, like the invoice email: a Meta error must never fail the customer's order.

CAPI needs the browser Pixel working first, so it comes after step 7 of the rollout.

---

## 8. Optional, later: product catalog

For **dynamic product ads** (Meta automatically shows people the exact products they viewed), Meta needs a **product catalog**: a feed of products with ID, name, price, image URL, link and availability. It would be a new read-only server endpoint (for example `GET /api/feeds/meta-catalog.csv`) built from the products and variants tables, which Meta fetches daily. The product IDs must match `content_ids` in section 6. Only worth doing if the business runs retargeting ads.

---

## 9. Rollout plan

| # | Step | Done when |
|---|---|---|
| 1 | Owner sets up Business portfolio and Pixel, and sends the Pixel ID (section 2) | Pixel ID received |
| 2 | Verify `elmaghrib.com` in Meta Business settings (DNS TXT record in Plesk) | Domain shows "Verified" |
| 3 | Update the Privacy Policy (section 3, point 4). It's editable in Admin → Pages | Policy published |
| 4 | Set `cookieConsent: true` in `features.js` | Banner live; Marketing switch works |
| 5 | Add `VITE_META_PIXEL_ID` to `.env.production` and `.env.example`; build `analytics/metaPixel.js` | Pixel loads only after Marketing consent |
| 6 | Add the event calls from section 6 | All events visible in Events Manager → **Test events** |
| 7 | Test (section 10), build and deploy | Checklist passes on the live site |
| 8 | (Recommended) Add Conversions API on the server (section 7) | Events Manager shows Purchase from **Browser and Server**, de-duplicated |
| 9 | In Events Manager, check **Event Match Quality** and the Diagnostics tab after a few days | No warnings about duplicates or missing parameters |

## 10. Test checklist

- [ ] First visit: no requests to `connect.facebook.net` or `facebook.com/tr` in DevTools → Network.
- [ ] "Technical only" and Analytics-only: still no Facebook requests, even through a full purchase.
- [ ] "Accept all" (or Marketing on): `fbevents.js` loads and the `_fbp` cookie appears.
- [ ] Withdraw via footer "Cookie settings": events stop and `_fbp` / `_fbc` cookies are removed.
- [ ] Each event in section 6 appears in **Test events** with correct product IDs, values and EUR. The **Meta Pixel Helper** browser extension helps here.
- [ ] One test purchase produces exactly **one** `Purchase`, including after refreshing the confirmation page (and, with CAPI, one de-duplicated Browser + Server event).
- [ ] Each page change produces exactly one `PageView`.
- [ ] No names, emails, phones or addresses in event parameters.
- [ ] Local dev (`npm run dev`) sends nothing (no Pixel ID in `.env.development`).
