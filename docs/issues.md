# Bug Fixes — KAN Tickets (October 2026)

Status of each Jira ticket: what caused it and how it was resolved, grouped by app.
The fixes are in the working tree and **not yet deployed**; see [Deployment](#deployment) at the end.

**Status key:** ✅ Fixed in code · ⚠️ Not reproduced (more info needed)

## Summary

| Ticket | Title | Apps touched | Status |
|---|---|---|---|
| KAN-3 | Unable to add new countries for shipping (disappear after refresh) | Admin, Server | ⚠️ Partly fixed |
| KAN-4 | Login page functionality not working | Client, Admin, Server | ✅ |
| KAN-10 | Stock is not displaying as expected | Admin, Server | ✅ |
| KAN-13 | In Safari, UI is not as expected | Client | ⚠️ Not reproduced |
| KAN-23 | Previous default delivery charges reflecting in cart page | Client, Server | ✅ |
| KAN-24 | Can't update or delete products in the cart + backend error shown on UI | Client, Server | ✅ |
| KAN-27 | User redirected to homepage when all cart items are removed | Client | ✅ (already in `8c7d8f7`) |
| KAN-28 | Misalignment on mobile screen | Client | ✅ |
| KAN-29 | No limit on coupon percentage | Admin, Server | ✅ |
| KAN-30 | Unable to edit existing product | Admin, Server | ✅ |
| KAN-31 | Unable to add new products | Admin, Server | ✅ |
| KAN-32 | Blank screen on refreshing page at /store | Client (+ hosting) | ✅ |

---

## Client (storefront)

| Ticket | Bug | Cause | Fix |
|---|---|---|---|
| KAN-32 | Blank screen when refreshing `/store` | `/httpdocs` still has a leftover physical `store/` folder from an old upload. On refresh, IIS redirects `/store` → `/store/` and serves that folder's stale `index.html`, which loads a script (`/assets/index-PFwgAPJh.js`) that no longer exists. The server returns HTML instead of JS, so the app never starts. Client-side navigation was unaffected, which is why only a refresh broke. | [client/public/web.config](../client/public/web.config): new rule that always rewrites `/store` routes to the app's `index.html`. [Store.jsx](../client/src/pages/Store.jsx): no longer crashes on a non-array response. **Also delete `/httpdocs/store/` on the server.** |
| KAN-23 | Old €35 delivery charge shown on cart/checkout | The admin's "Default International Rate" (currently €20) was never sent to the storefront. `/api/site-settings/public` deliberately left it out, so Checkout fell back to a hardcoded €35, and Cart showed the cheapest country rate instead. A rate of €0 was also treated as "not set". The server always charged the real default, so the displayed price didn't match the charged price. | [Cart.jsx](../client/src/pages/Cart.jsx) and [Checkout.jsx](../client/src/pages/Checkout.jsx) now read `default_intl_shipping_fee` from site settings, and €0 is respected. Verified locally: cart shows €20.00. |
| KAN-24 | Can't update/delete cart items | (1) For a logged-in user with an empty server cart, the Cart page fell back to the old sessionStorage guest cart. Those items have no `cart_item_id`, so update/delete called `/api/cart/undefined` and failed. (2) The header cart drawer read the logged-in user only on first page load, so after logging in without a reload it kept using the guest code path and +/− and delete did nothing. (3) The cart refetched before the DELETE finished, so a removed item could reappear. | Logged-in users only see their server cart. The update/delete thunks refuse to run without an ID. [CartDrawer.jsx](../client/src/components/CartDrawer.jsx) re-reads the session on `user-login`/`user-logout` events, and [Header.jsx](../client/src/components/Header.jsx) now fires `user-logout`. The refetch only happens after the DELETE completes (Cart, CartDrawer, ItemsList). |
| KAN-24 | Raw backend errors shown on UI | The axios interceptor popped `"<status>: <server message>"` for every failed request. | Cart thunks in [cartSlice.js](../client/src/redux/slices/cartSlice.js) opt out of the global toast (`skipGlobalError` in [axios.js](../client/src/utils/axios.js)) and show friendly messages: "Cart updated successfully!", "Item removed from cart.", "This item was already removed from your cart." |
| KAN-27 | Redirected to the home page when the cart becomes empty | An earlier change navigated to `/` after the last item was deleted. | Already removed in commit `8c7d8f7`; the "Your Cart is Empty" screen now stays put. Needs a redeploy to reach the live site. |
| KAN-4 | Login not working | (1) If merging the guest cart into the account failed, the whole login showed "Login failed" even though the user was logged in (token already stored). (2) Leading/trailing spaces from phone keyboards broke the email/username match. (3) Error messages were empty because IIS replaces API error bodies (see the Server section below). (4) The cart drawer didn't pick up the login (see KAN-24). | [Login.jsx](../client/src/pages/Login.jsx): guest-cart merge is now best-effort with a warning toast. Identifier is trimmed. Error text falls back to the HTTP status (401 → wrong credentials, 403 → not registered). |
| KAN-28 | Misalignment on mobile | 9 store/category/listing pages used a fixed `padding: 2rem 6rem` (96px each side), squeezing content on phones. | Padding is now `clamp(1rem, 5vw, 6rem)`: 16px on phones, growing to 96px on desktop. Verified in iPhone WebKit. |
| KAN-13 | Safari UI not as expected | **Not reproduced.** The live site renders correctly in WebKit (iPhone 13 and desktop) with no horizontal overflow. The earlier Safari 15 colour fix (no `oklch()` in the CSS) is already live. | Need a screenshot, the page URL and the Safari/iOS version from the tester. |

## Admin panel

| Ticket | Bug | Cause | Fix |
|---|---|---|---|
| KAN-29 | No limit on coupon percentage | The coupon form had no range validation, so values like 150% could be saved. | [Coupons.jsx](../admin/src/pages/Coupons.jsx): value must be 1–100% (`min`/`max` rules and input limits). Usage limit must be ≥ 1. |
| — | 500 error when updating a coupon | The form didn't check for a code another coupon already uses (in any case), a code over 50 characters, or a very large usage limit. Edits also silently reset "used count" to 0, because the form doesn't send it. | [Coupons.jsx](../admin/src/pages/Coupons.jsx): duplicate-code check against the loaded list, code max 50 characters, usage limit within range, code trimmed before saving. |
| KAN-30 / 31 | Can't edit or add products | The file pickers accepted any `image/*` (including iPhone HEIC, AVIF, BMP), but the server only accepts PNG/JPG/WEBP/GIF up to 10 MB each. Uploads over ~28 MB in total were rejected by IIS with an HTML page, so the admin only saw a vague "Failed to save product". An empty category was sent as the string `"undefined"`. | [Products.jsx](../admin/src/pages/Products.jsx): files are validated on pick (type + 10 MB), with a clear message. Saving is blocked if new images total more than 25 MB. `category_id` is only sent when chosen. [api.js](../admin/src/services/api.js): non-JSON failures now show a meaningful message (too large / session expired / HTTP status). |
| KAN-10 | Stock not displaying as expected | The admin showed product-level stock, while the shop shows per-variant (size/colour) stock. Example from live data: "Mousouf" showed 10 in admin but 0 in the shop. | The stock column also shows the per-variant stock (e.g. "variants: 0") whenever it differs from the product value. |
| KAN-3 | Shipping countries disappear after refresh | **Not reproduced.** The saved countries exist in the database, the live API returns them, CORS is correct and the live admin points at the right API. One real bug found: `shipping_rates.estimated_days` is `nvarchar(32)`, so longer Delivery Time text made the save fail. | [Shipping.jsx](../admin/src/pages/Shipping.jsx): Delivery Time limited to 32 characters (with a counter). The generic API wrapper now reports the HTTP status instead of "An error occurred". **Need the tester's exact steps** (which country, any message shown). |
| KAN-4 | Admin login errors unclear | Same empty-error-body problem as the storefront. | [admin Login.jsx](../admin/src/pages/Login.jsx): identifier is trimmed and errors fall back to the HTTP status. |

## Server (API)

| Ticket | Bug | Cause | Fix |
|---|---|---|---|
| KAN-23 | Wrong delivery charge on storefront | `default_intl_shipping_fee` was missing from the public settings fields. | Added to `PUBLIC_FIELDS` in [siteSettingsController.js](../server/controllers/siteSettingsController.js); it's a customer-facing price, not a secret. |
| KAN-29 | No limit on coupon percentage | Create/update accepted any value, and a coupon above 100% made order totals negative. | [couponController.js](../server/controllers/couponController.js): percentage values > 100 (or ≤ 0) are rejected with 400. `validateCoupon` caps legacy coupons at 100%. |
| — | 500 error when updating a coupon | `updateCoupon` skipped the checks that create does. Renaming to an existing code violated the `UQ_coupons_code` unique index, and a code over 50 characters, a usage limit over the INT range or missing dates also reached SQL Server and failed. `used_count` was reset to 0 on every edit. Reproduced against live data, with the changes rolled back. | [couponController.js](../server/controllers/couponController.js): same validation as create, duplicate check that excludes the coupon being edited (409), and unique-index errors mapped to 409 on create and update. `used_count` is kept when it isn't sent. Verified: the failing inputs now return 400/409 and normal edits still save. |
| KAN-24 | Unsafe cart update query | `updateCartItem` interpolated `quantity` and `cartItemId` directly into the SQL string, with no validation (SQL injection risk). | [addToCartController.js](../server/controllers/addToCartController.js): parameterised query. ID must be a positive integer, quantity must be 1–10. Returns 404 if the item doesn't exist. |
| KAN-10 | Stock not updating in the shop | `updateProduct` saved the product's stock but never updated existing variants, which are what the shop displays and what checkout deducts from. | [productController.js](../server/controllers/productController.js): when the stock value changes, it's applied to all of the product's variants. Re-saving without changing stock leaves sales deductions intact. `getAllProducts` now returns `variant_stock_min`/`variant_stock_max` for the admin. Verified against live data with the transaction rolled back. |
| KAN-30 / 31 | Product save failures | Long uploaded file names overflowed `products.size_chart` (`varchar(100)`). `parseInt("undefined")` produced `NaN` for an empty category. Edit errors returned a bare "Server error". | [upload.js](../server/middleware/upload.js): base file names capped at 40 characters. `toInt` treats `NaN` as `null`. The update error now includes the real reason. |
| KAN-3 | Shipping save failure | Delivery Time over 32 characters failed the INSERT. | [shippingRatesController.js](../server/controllers/shippingRatesController.js): returns a clear 400 message instead. |
| KAN-4 | Login fails with stray spaces | The identifier wasn't trimmed. | [userController.js](../server/controllers/userController.js): identifier is trimmed, and missing fields return a 400. |
| All | Vague error messages everywhere | IIS on `api.elmaghrib.com` replaces every 4xx/5xx JSON body from the API with a Plesk HTML error page, so the frontends never receive the real message. | **Server config change required:** add `<httpErrors existingResponse="PassThrough" />` inside `<system.webServer>` in the API's `web.config` (`/api.Elmaghrib.com/`, managed on the server, not in the repo). The frontends now also fall back to status codes. |

---

## New identifications

Bugs found while testing, not raised as KAN tickets.

| App | Bug | Cause | Fix |
|---|---|---|---|
| Admin | "Access Denied" loop after the login expires | Admin tokens expire after 1 day. The live API then answers `/users/me` with 403, which the admin didn't treat as an expired session, so the token stayed saved. "Go to Login" opened `/login`, which saw the saved token and sent the user straight back to the Access Denied page. | [App.jsx](../admin/src/App.jsx): a failed access check (other than a network error) clears the saved session, and "Go to Login" clears it too. |
| Admin | Shipping "Default International Rate" Save button text invisible | The button is disabled until the rate changes, and its forced black text sat on the dark disabled background. | [Shipping.jsx](../admin/src/pages/Shipping.jsx): black text only while the button is enabled. |
| Client | No "Cart updated" toast when adding a new item | The toast came only from the cart-update step, which runs when the item is already in the cart. Adding a new item, and every guest add, finished silently. | [cartSlice.js](../client/src/redux/slices/cartSlice.js): `addToCart` shows "Cart updated successfully!" after a new item is added (logged in) and after any guest add. |
| Client | Order Confirmed buttons hard to read | "Continue Shopping" and "Back to Home" relied on utility classes competing with the global `a` / `a:hover` link colours. | [CheckoutComplete.jsx](../client/src/pages/CheckoutComplete.jsx) + [index.css](../client/src/index.css): dedicated `.order-btn` styles with fixed colours for normal, visited, hover, focus and pressed states. |
| Admin | Stock per colour/size not understandable | Admin edited one "Stock" number, but the shop sells (and deducts) stock per colour + size. The numbers drifted apart (e.g. Mousouf: 12 in admin, 28 in the shop) and "variants" is developer wording. | [Products.jsx](../admin/src/pages/Products.jsx) + new [VariantStockGrid.jsx](../admin/src/components/VariantStockGrid.jsx): a "Stock by colour & size" grid (colours × sizes, "Set all to", total). The list shows the real total, "N of M options sold out", and an expandable breakdown. |
| Server | Stock saved only as one number | `createProduct`/`updateProduct` copied a single stock value to every colour/size. | [productController.js](../server/controllers/productController.js): accepts `variant_stock` per colour/size and keeps the product total equal to the sum. The product list returns totals and sold-out counts, and product detail returns `variant_stock`. Verified on live data with rollback. |
| Admin | "View all notifications" did nothing | The link was a plain button with no action, and there was no notifications page. The bell only lists *unread* items, so once read (all 64 on live were) a notification could never be seen again. | New [Notifications.jsx](../admin/src/pages/Notifications.jsx) page (sidebar + `/notifications`): All / Unread / Read tabs, filter by type, pages of 20, open, mark read, delete, mark all read. |
| Admin | Notifications didn't lead anywhere | Clicking one only marked it read. | Shared [notifications.jsx](../admin/src/utils/notifications.jsx): each type has a label, icon and destination (orders open the exact order via `/orders?order=<id>`, low stock → Products, coupon → Coupons, new customer → Customers). Used by both the bell and the page. |
| Admin | Bell could list a notification twice, no alert on arrival | Live (socket) items were prepended even if the 30-second refresh had already fetched them. | [AdminHeader.jsx](../admin/src/components/layout/AdminHeader.jsx): de-duplicated by id, short popup on arrival, bell and page stay in sync, mark-all errors are shown. |
| Server | Anyone could receive admin notifications | The socket let any client into the admin room by sending `{ role: 'admin' }` without a token, exposing order and customer details. | [notificationSocket.js](../server/sockets/notificationSocket.js): a verified admin token is required. |
| Server | Checkout could fail after the order was saved | The "new order" notification wasn't guarded; if saving it failed, the customer got an error and the invoice email was skipped even though the order existed. | [checkoutController.js](../server/controllers/checkoutController.js): notification is best-effort. |
| Server | Low-stock notification used developer wording | "Mousouf variant #57 low stock (2)". | [inventoryController.js](../server/controllers/inventoryController.js): "Mousouf (black, size M): only 2 left." / "Sold out". |
| Server | No way to list all or delete notifications | Only `/unread`, mark read and mark all read existed. | [notificationController.js](../server/controllers/notificationController.js): `GET /api/notifications` (status, type, page) and `DELETE /api/notifications/:id`, admin-only. Tested read-only on live data. |
| Admin | Theme colour classes never applied | Tailwind v4 ignores `tailwind.config.js` without `@config`, so `bg-card`, `border-border`, `hover:bg-accent` etc. (~40 uses) generated no CSS. | [index.css](../admin/src/index.css): `@theme inline` maps them to the colour variables. |
| Admin | No light/dark theme switch | Colours were dark-only and partly typed directly into components. | Sun/moon button in the header ([ThemeProvider.jsx](../admin/src/theme/ThemeProvider.jsx)); choice is remembered per browser, first visit follows the device setting. Light palette in CSS and [antdTheme.js](../admin/src/config/antdTheme.js); fixed colours replaced with theme colours. The sidebar follows the theme too, with the black logo in light mode and the white logo in dark mode ([AdminSidebar.jsx](../admin/src/components/layout/AdminSidebar.jsx)). Primary buttons take their text colour from the theme ([AppButton.jsx](../admin/src/components/AppButton.jsx)), and white "Delete?" confirm buttons are now red. |
| Admin | White strip behind the sidebar logo | The logo box had a `bg-foreground` class that did nothing until the theme colour classes were fixed (see below), then painted it white. | [AdminSidebar.jsx](../admin/src/components/layout/AdminSidebar.jsx): background class removed. |
| Server | Expired login returned 403 | `verifyToken` answered an expired/invalid token with 403, so neither frontend recognised it as "log in again". | [auth.js](../server/middleware/auth.js): now 401. 403 stays for "logged in but not an admin". |

---

## Deployment

1. **Server:** push the `server/` changes to `prod`; the GitHub Action deploys them over FTP.
2. **Frontends:** rebuild `client` and `admin` (`npm run build`) and upload both `dist/` folders. The client upload includes the new `web.config`.
3. **Plesk File Manager:** delete the leftover `/httpdocs/store/` folder.
4. **API `web.config`:** add `<httpErrors existingResponse="PassThrough" />`.
5. **Data:** for products whose shop stock is wrong (e.g. Mousouf), set the stock in the admin to the desired value and save.

## Still open

- **KAN-3:** reproduction steps from the tester (country chosen, any message shown).
- **KAN-13:** screenshot, page URL and Safari/iOS version from the tester.
