# Auth Remediation Plan — Login, Signup & Password

Fix plan for every issue in [login-signup-and-password.md](./login-signup-and-password.md).

Work is grouped into phases because **the order matters**: enforcing server-side auth (#1) before the storefront actually sends a token (#7) would break every logged-in customer flow. Each phase is independently shippable.

---

## Phase 0 — Cleanup (no behavior change, no risk)

### #11 Delete the dead `/api/auth` login
Verified: nothing imports [server/routes/auth.js](../server/routes/auth.js) — its only reference is its own `require` of the controller, and it is never mounted in `index.js`.

- Delete [server/routes/auth.js](../server/routes/auth.js) and [server/controllers/authController.js](../server/controllers/authController.js).

### #6 Strip debug logging
- [ForgotPassword.jsx:30-71](../client/src/pages/ForgotPassword.jsx#L30) — delete the numbered `console.log`s. The clean implementation already sits commented out at [lines 11-28](../client/src/pages/ForgotPassword.jsx#L11); restore that and delete the duplicate.
- [userController.js:28-33](../server/controllers/userController.js#L28) — remove the SMTP config `console.log` (leaks host/user/`hasPassword`).
- [userController.js:43-44](../server/controllers/userController.js#L43) — set `logger: false, debug: false` (or drop both keys).
- [userController.js:96-98](../server/controllers/userController.js#L96) — remove the `await transporter.verify()` call; it's a debugging artifact that adds a full extra SMTP round-trip to every reset.
- [userController.js:586-602](../server/controllers/userController.js#L586) and [:132-136](../server/controllers/userController.js#L132) — remove logs of submitted emails, `"looking for user"`, full recordsets, and message metadata.

### #5 Fix the `undefined` success toast
- [ForgotPassword.jsx:54](../client/src/pages/ForgotPassword.jsx#L54): `response.message` → `response.data.message`. (Resolved automatically if you restore the commented block above, which uses a literal string.)

### #17 Remove duplicate success toasts
- [client/src/pages/Login.jsx:53](../client/src/pages/Login.jsx#L53) — delete; keep the "Welcome back" toast at line 50.
- [admin/src/pages/Login.jsx:50](../admin/src/pages/Login.jsx#L50) — same.

---

## Phase 1 — Server hardening (safe: no client contract changes)

### #2 🔴 Stop accepting `is_admin` from the register body
- [userController.js:235](../server/controllers/userController.js#L235) — remove `is_admin` from the `req.body` destructure.
- [userController.js:335](../server/controllers/userController.js#L335) and [:379](../server/controllers/userController.js#L379) — hardcode `sql.Bit, false` on both insert paths.
- Admin promotion stays only in `updateUser`, which Phase 3 puts behind `requireAdmin`.

### #4 Close the enumeration leak in forgot-password
- [userController.js:612-617](../server/controllers/userController.js#L612) — keep the `try/catch` around `sendPasswordResetEmail`, but log the failure and **fall through to the generic 200** instead of returning 500. The endpoint then returns an identical response in all three cases (unknown email / known email / mail failure).

### #13 Validate the register payload
- At the top of `registerUser`, before any DB or DNS work: require `email`, `username` and `password`, and enforce `password.length >= 6` (matching the reset rule). Return `400` with a specific message.
- Prevents the current `bcrypt.hash(undefined)` throw → opaque 500.

### #19 Make reset respect account state
- [userController.js:648-657](../server/controllers/userController.js#L648) — before updating, confirm the account exists **and** `u.is_registered = 1` (join `users`). Otherwise a password can be set on an account that login then rejects with `403 User is not registered`.

### #12 Wrap registration in a transaction
- [userController.js:352-384](../server/controllers/userController.js#L352) — the `users` insert and `credentials` insert must be atomic:
  ```js
  const tx = new sql.Transaction();
  await tx.begin();
  try {
    const rq = new sql.Request(tx);   // note: must bind the request to the transaction
    // ...both inserts...
    await tx.commit();
  } catch (e) {
    await tx.rollback();
    throw e;
  }
  ```
- Every `new sql.Request()` inside the block must become `new sql.Request(tx)`, and inputs must be re-declared per request object.
- Keep the existing "user exists without credentials" recovery branch — it repairs rows orphaned before this fix.

---

## Phase 2 — Token plumbing (prerequisite for Phase 3)

The token currently lives under inconsistent keys and is written/cleared by different layers. Unify it first.

### #8 Admin: settle on one storage key
Verified: **`admin/src/utils/axios.js` is imported by nothing** — the admin app talks to the API exclusively through `services/api.js`, which reads `authToken`.

- Delete the unused [admin/src/utils/axios.js](../admin/src/utils/axios.js).
- [admin/src/pages/Login.jsx:43](../admin/src/pages/Login.jsx#L43) — drop the duplicate `localStorage.setItem('token', …)`; keep `authToken` only.
- [AdminHeader.jsx:39-40](../admin/src/components/layout/AdminHeader.jsx#L39) — clear `authToken` and `user` (replacing the `token` removal that cleared the wrong key).

### #7 Storefront: actually store the token
- [client/src/pages/Login.jsx:24](../client/src/pages/Login.jsx#L24) — add `localStorage.setItem('token', loginRes.data.token)` alongside the existing `user` write.
- **Caveat to carry into Phase 3:** [Login.jsx](../client/src/pages/Login.jsx), [Signup.jsx](../client/src/pages/Signup.jsx) and [ForgotPassword.jsx](../client/src/pages/ForgotPassword.jsx) import bare `axios`, not the configured instance at [client/src/utils/axios.js](../client/src/utils/axios.js) — only the instance attaches the `Authorization` header. Any storefront call that becomes protected must be migrated to the instance.

### #10 Storefront: one logout implementation
- [Header.jsx:129-135](../client/src/components/Header.jsx#L129) — replace the ad-hoc `localStorage.removeItem('user')` with a dispatch of the existing `logout` action in [userSlice.js:25-29](../client/src/redux/slices/userSlice.js#L25), which already clears both `user` and `token`.
- Also dispatch `clearCart` so the next visitor doesn't inherit the previous user's cart items.

### #9 Fix the dead 401 redirect
- [client/src/utils/axios.js:49](../client/src/utils/axios.js#L49) — `'/login'` → `'/my-account'` (the storefront has no `/login` route).
- Clear `user` as well as `token` on 401, so the header stops rendering a logged-in state.

---

## Phase 3 — Enforce authentication (the critical fix)

### #1 🔴 Apply `verifyToken` to routes
[server/middleware/auth.js](../server/middleware/auth.js) already works correctly and populates `req.user = { id, is_admin }`. It just needs to be used.

**Step 1 — add an admin guard.** New `requireAdmin` middleware (same file or a sibling), to run after `verifyToken`, rejecting with 403 when `!req.user.is_admin`.

**Step 2 — protect admin mutations first.** These are the highest-risk endpoints, and the admin app already sends `Authorization` after Phase 2, so nothing breaks:
- `users` — `GET /`, `PUT /:id`, `DELETE /:id`, `GET /customers`
- write routes on `products`, `categories`, `subcategories`, `colors`, `sizes`, `coupons`, `pages`
- `shipping` — `POST/PUT/DELETE` (leave `GET /` and `GET /:country` public; the Cart and Checkout pages call them anonymously)
- `site-settings` — `PUT /` and the upload routes (leave `GET /` public)
- `orders` and `notifications` admin views

Apply per-route (`router.put('/:id', verifyToken, requireAdmin, handler)`) rather than at the `app.use` level, so public GETs in the same router stay open.

**Step 3 — protect customer routes.** Only after Phase 2 ships and the storefront calls are on the axios instance. Guest cart and guest checkout must stay public — gate on the presence of a `user_id` in the request rather than blanket-protecting `/api/cart` and `/api/checkout`.

**Step 4 —** leave permanently public: `login`, `register`, `check-email`, `forgot-password`, `reset-password`, and product/category browsing.

### #18 Give the admin guard real teeth
- Add `GET /api/users/me`, protected by `verifyToken`, returning the caller's `{ user_id, username, email, is_admin }` derived from the **token**, not the request body.
- [admin/src/App.jsx:22-29](../admin/src/App.jsx#L22) — have `Protected` call it once on mount and redirect to `/login` on 401/403, instead of trusting `localStorage.user.is_admin`.
- Client-side checks remain a UX convenience; Step 2 above is what actually enforces access.

---

## Phase 4 — Schema change

### #3 Make reset tokens single-use
Requires one new column. Recommended approach — `password_changed_at`, which gets single-use tokens *and* invalidation of concurrently-issued links from one field:

```sql
ALTER TABLE credentials ADD password_changed_at DATETIME NULL;
```

- In `resetPassword` ([userController.js:630](../server/controllers/userController.js#L630)), after verifying the JWT, read `password_changed_at` for `payload.id` and reject the token when `payload.iat * 1000 < password_changed_at` — every JWT already carries `iat`, so no token format change is needed.
- Set `password_changed_at = GETDATE()` in the same `UPDATE` that writes the new hash. A replayed link then has `iat` older than `password_changed_at` and is refused.
- This also invalidates any other outstanding reset links for that account.

**Optional follow-up:** add the same claim check to login tokens to force logout-everywhere on password change. Larger blast radius — treat as separate work.

---

## Phase 5 — Signup UX & consistency

### #14 Align password rules
- [Signup.jsx:111-116](../client/src/pages/Signup.jsx#L111) — add `{ min: 6 }` and a confirm-password field, mirroring [ResetPassword.jsx:55-80](../client/src/pages/ResetPassword.jsx#L55) (which already has the `dependencies` + `validator` pattern to copy).
- Server-side minimum is covered by #13.

### #15 Collect the fields the schema expects
- [Signup.jsx:86-116](../client/src/pages/Signup.jsx#L86) — add First name / Last name inputs and include them in the POST body.
- Fixes the `Hi ,` welcome email ([userController.js:74](../server/controllers/userController.js#L74)) and the blank names in the admin Users/Customers tables.

### #16 Auto-login after signup
- Have `registerUser` sign and return the same `{ message, data, token }` shape as `loginUser` (reuse that block), then in [Signup.jsx:65-67](../client/src/pages/Signup.jsx#L65) store `user` + `token` and navigate to `/` instead of bouncing to `/my-account`.
- Flagging as a product decision — if you prefer users to log in explicitly after registering, skip this and the current behavior is correct.

---

## Verification

- **Phase 0-1:** register with `is_admin: true` in the body and confirm the created account is not an admin; POST forgot-password for a known email, an unknown email, and with SMTP misconfigured — all three must return an identical 200; register with a 3-char and a missing password → 400, not 500; force a failure between the two register inserts and confirm no orphaned `users` row.
- **Phase 2:** log in on both apps and confirm the token is stored under the expected key; log out and confirm `localStorage` retains no `token`/`authToken`/`user`; trigger a 401 and confirm the storefront lands on `/my-account`.
- **Phase 3:** with no token, call each protected endpoint and expect 401; with a non-admin token, expect 403; then walk the admin UI end to end and the storefront's guest browse → add to cart → guest checkout path to confirm nothing regressed.
- **Phase 4:** complete a reset, then replay the same link — expect "invalid or has expired"; request two links and confirm using the newer one invalidates the older.
- **Phase 5:** sign up and confirm names reach the DB, the welcome email is addressed correctly, and mismatched passwords are rejected client-side.
