# Cart Page: Empty-Cart Redirect + Real Delivery Charges

## Context
The Cart page ([client/src/pages/Cart.jsx](../client/src/pages/Cart.jsx)) had two problems:

1. There was no redirect when the cart became empty — the `isCartEmpty` flag was computed but never acted on. Desired behavior: once the last item is removed from the cart, send the user to the homepage.
2. The "Shipping Charges" shown in the order summary was a literal hardcoded string, `€35.00`, and the total calculation hardcoded `+ 35` — it never reflected real data.

There is no `/api/settings/config` endpoint in the backend, and the actual site-settings endpoint (`/api/site-settings`) has no delivery-charge field at all (it only stores hero/footer copy). The real, already-working source for delivery fees is `GET /api/shipping/:country` (backed by the `shipping_rates` SQL table, `fee` column), which [Checkout.jsx](../client/src/pages/Checkout.jsx) already calls once a country is selected. Cart.jsx reuses this same `/api/shipping` subsystem rather than inventing a new settings field.

Cart.jsx has no country context yet (no address/country is collected until Checkout), so it can't call `/api/shipping/:country` directly. Instead it calls `GET /api/shipping` (returns all active rates) and shows the lowest active fee as an "Estimated Shipping" figure, clearly labeled as an estimate finalized at checkout — consistent with how Checkout.jsx later fetches the precise per-country fee.

**Known, separate issue (not fixed here):** `checkoutSlice.js`'s `placeOrder` thunk hardcodes `shippingCharges = 35` for the actual order total, ignoring the dynamic per-country fee. That's a pre-existing bug in the checkout/order-placement flow, not the Cart page.

## Changes made — [client/src/pages/Cart.jsx](../client/src/pages/Cart.jsx)

### 1. Redirect to home when the cart becomes empty
In `handleDelete`, the check happens synchronously against the *current* `cartItems` length before the removal completes — deleting the last remaining item means `cartItems.length === 1` at the time of the click. This avoids any race with async redux/sessionStorage updates and avoids the pitfall of a passive `useEffect` on `isCartEmpty` firing prematurely (cartItems starts as `[]` on mount before the fetch resolves, which would cause a false redirect on every page load).

```js
const handleDelete = (itemToDelete) => {
    const wasLastItem = cartItems.length === 1;
    // ...removal logic (user vs guest)...
    if (wasLastItem) {
        navigate('/');
    }
};
```

### 2. Fetch and use a real delivery charge
- Added `shippingFee` state (default `35` as a last-resort fallback) populated on mount via:
  ```js
  fetch(`${import.meta.env.VITE_BACKEND_SERVER_URL}/api/shipping`, { credentials: 'include' })
  ```
  (same pattern already used in Checkout.jsx), picking the lowest `fee` among rows with `status === 'active'`.
- Replaced the hardcoded `€35.00` with the fetched `shippingFee`, relabeled "Estimated Shipping" since it's not yet country-specific.
- Replaced the hardcoded `+ 35` in the total calculation with `+ shippingFee`.

## Verification
- Add multiple items to the cart, then delete items one by one on the Cart page — no redirect happens until the very last item is deleted, at which point the app navigates to `/`.
- Works both for a logged-in user (redux-backed cart, `removeFromCart` thunk) and a guest (sessionStorage-backed cart).
- "Estimated Shipping" and "Total" figures reflect the value returned by `GET /api/shipping` instead of the static `35` — cross-check against the `shipping_rates` table / admin Shipping page ([admin/src/pages/Shipping.jsx](../admin/src/pages/Shipping.jsx)).
- Fetch-failure fallback path (e.g. backend down) still renders a usable shipping figure instead of crashing or showing `NaN`.

---

## Exploration findings

### 1. Cart page component & existing redirect logic
- File: [client/src/pages/Cart.jsx](../client/src/pages/Cart.jsx) — component is internally named `Checkout` but exported as default from `Cart.jsx`.
- `useEffect`s merge `reduxCart` (from `state.cart.items`) with `sessionStorage.guestCart`, and listen for `guestCartUpdated` / `cartUpdated` window events.
- `isCartEmpty` was computed but **not used to redirect anywhere** — not even wired to disable the action buttons (those `disabled={isCartEmpty}` props were commented out).
- **No automatic/effect-driven redirect on empty cart existed anywhere in the app.** The same unused `isCartEmpty` pattern also appears in `client/src/components/CartDrawer.jsx` and `client/src/components/ItemsList.jsx`, only used for conditional rendering, never navigation. All existing `navigate(...)` calls were tied to explicit user actions (button clicks) or checkout success/error handlers.

### 2. Delivery/shipping charge hardcoding (before the fix)
Three independent hardcodes of `35`, with no shared source of truth:
- `client/src/pages/Cart.jsx` — literal `€35.00` display, and `+ 35` in the total calculation.
- `client/src/pages/Checkout.jsx` — `const [shippingFee, setShippingFee] = useState(35);` as a default, but Checkout.jsx *does* fetch the real fee from `/api/shipping/:country` once a country is selected (falling back to `35` on error).
- `client/src/redux/slices/checkoutSlice.js` — `const shippingCharges = 35;`, used in the `placeOrder` thunk's total calculation. This one is **not** wired to the dynamic per-country fee at all — order totals are always computed with a flat `35` server-payload-side, even though Checkout.jsx displays the correct per-country fee. Still unresolved.

### 3. Settings/config API investigation
- **No `/api/settings/config` endpoint exists anywhere in the codebase.**
- The real settings endpoint is `GET /api/site-settings/` ([server/routes/siteSettingsRoutes.js](../server/routes/siteSettingsRoutes.js), mounted in `server/index.js`). It's backed by a flat JSON file (`server/data/site_settings.json`), not a database model, and only contains hero/intro/footer copy and image URLs — **no delivery/shipping field exists in this schema**, and the `updateSettings` allow-list would silently drop one if added without a schema change.
- Endpoint is fully **public** (no auth middleware applied).
- The admin "Settings" page ([admin/src/pages/Settings.jsx](../admin/src/pages/Settings.jsx)) is unrelated/non-functional — a static mock form that never calls any API.

### 4. The actual delivery-charge mechanism: `/api/shipping`
- Router: [server/routes/shipping.js](../server/routes/shipping.js) — `GET /api/shipping/` (all rates), `GET /api/shipping/:country` (single rate), plus public (no-auth) `POST`/`PUT`/`DELETE`.
- Controller: [server/controllers/shippingRatesController.js](../server/controllers/shippingRatesController.js) — raw `mssql` queries against a `shipping_rates` table (`id, country, country_code, fee, currency, estimated_days, status`). No ORM model file; field name for the charge is `fee`.
- `getByCountry` returns `{ id, country, countryCode, fee, currency, estimatedDays, status }`, 404 if no active rate matches.
- Already consumed by `Checkout.jsx` via plain `fetch` (not the shared axios instance) with `credentials: 'include'`.
- Admin CRUD UI: [admin/src/pages/Shipping.jsx](../admin/src/pages/Shipping.jsx), via `shippingApi` in `admin/src/services/api.js`.

### Cart state management (for context)
- No React Context/CartProvider exists — cart state is entirely Redux Toolkit, in [client/src/redux/slices/cartSlice.js](../client/src/redux/slices/cartSlice.js).
- Guest cart persistence is via `sessionStorage.guestCart`, synchronized across components with custom `window` events (`guestCartUpdated`, `cartUpdated`) instead of Context — this pattern is duplicated near-identically across `Cart.jsx`, `CartDrawer.jsx`, and `ItemsList.jsx`.
- Noted (unrelated) latent bugs found during exploration, not fixed as part of this change:
  - `fetchCart` thunk ignores its argument and re-derives the user internally via `getLoggedInUser()`.
  - `updateCartItem` thunk's fulfilled payload references an undefined `data` variable (likely should be `res.data`).
  - `removeFromCart` thunk's axios call omits the `VITE_BACKEND_SERVER_URL` prefix used everywhere else.
  - `removeFromCart.fulfilled` filters `state.items` by `item.id`, while cart items elsewhere are keyed by `cart_item_id`.
