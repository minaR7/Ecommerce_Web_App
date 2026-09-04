# Login, Signup and Password — Issues, Bugs & Inconsistencies

Audit of the authentication flows across **server**, **client** (storefront) and **admin**.
Static code review only — the app was not run. State as of commit `bc7a9e5` (after the `feat(auth): added password reset flow` merge).

---

## Recently fixed (for context)

These were broken in an earlier revision and are now resolved — listed so they aren't re-reported:

- **Forgot/reset password is now fully implemented** — [ForgotPassword.jsx](../client/src/pages/ForgotPassword.jsx), [ResetPassword.jsx](../client/src/pages/ResetPassword.jsx), routes at [App.jsx:64-65](../client/src/App.jsx#L64), and server endpoints `/api/users/forgot-password` + `/api/users/reset-password` ([userRoutes.js:12-13](../server/routes/userRoutes.js#L12)).
- **DNS/MX check removed from login** ([userController.js:527-530](../server/controllers/userController.js#L527)) — outbound DNS failures no longer block valid logins.
- **Register recovers the orphan case** ([userController.js:287-348](../server/controllers/userController.js#L287)) — a `users` row with no `credentials` row (guest-checkout users) can now complete registration instead of being permanently locked out.

---

## 🔴 Critical

### 1. `verifyToken` is never applied to any route
- **Where:** [server/index.js:27](../server/index.js#L27) (import), [server/index.js:123](../server/index.js#L123) (only usage — commented out)
- Every API endpoint is fully public: orders, users, payments, coupons, shipping CRUD, site-settings, notifications.
- JWTs are issued at login and by the reset flow, but **nothing on the server ever verifies them**.
- Combined with issue #2, the entire admin API is reachable unauthenticated.

**Fix:** apply `verifyToken` (plus an `is_admin` check) to all write/admin routes.

### 2. Privilege escalation — `is_admin` accepted from the request body
- **Where:** [userController.js:235](../server/controllers/userController.js#L235) (destructured from `req.body`), [line 379](../server/controllers/userController.js#L379) (new-user path, inserted raw), [line 335](../server/controllers/userController.js#L335) (existing-user path, `is_admin ?? false` — still honors a supplied `true`)
- Any unauthenticated caller can `POST /api/users/register` with `is_admin: true` and self-provision an admin account.

**Fix:** never read `is_admin` from the register payload — hardcode `false`. Admin promotion should be a separate, authenticated endpoint.

---

## 🟠 High — password reset flow

### 3. Reset tokens are replayable
- **Where:** [userController.js:630-663](../server/controllers/userController.js#L630)
- `resetPassword` only verifies the JWT signature/expiry and runs an `UPDATE`. Nothing marks the token as consumed.
- Consequences:
  - The same reset link keeps working for the full 30 minutes **after** the password has been changed.
  - Changing a password invalidates neither outstanding reset links nor active login sessions.

**Fix:** requires server-side state — e.g. a `password_changed_at` or `reset_token_version` column on `credentials`, embedded in the token and compared on redemption. Needs a schema decision.

### 4. Account enumeration despite the generic response
- **Where:** [userController.js:616](../server/controllers/userController.js#L616)
- The endpoint deliberately returns a generic 200 so it never reveals whether an email is registered ([comment at lines 579-580](../server/controllers/userController.js#L579)) — but when the address **is** registered and the mail send fails, it returns **500**.
- A 500-vs-200 difference (and the SMTP round-trip latency in the found case) discloses account existence, defeating the stated intent.

**Fix:** log the mail failure server-side and still return the generic 200.

---

## 🟡 Medium

### 5. Forgot-password success toast shows `undefined`
- **Where:** [ForgotPassword.jsx:54](../client/src/pages/ForgotPassword.jsx#L54) — `toast.success(response.message)`
- On an axios response the payload is `response.data`, so `response.message` is `undefined`. Should be `response.data.message`.

### 6. Debug logging left in production code
- [ForgotPassword.jsx:31-50](../client/src/pages/ForgotPassword.jsx#L31) — numbered `console.log`s (`'1. onFinish called'`, values, backend URL, full response).
- [userController.js:28-33](../server/controllers/userController.js#L28) — logs SMTP host/port/user and `hasPassword`.
- [userController.js:586-602](../server/controllers/userController.js#L586) — logs the submitted email, `"looking for user"`, and the full user recordset.
- [userController.js:43-44](../server/controllers/userController.js#L43) — `logger: true, debug: true` on the nodemailer transporter, producing verbose SMTP transcripts.

Leaks user emails and mail-server details into logs.

### 7. The client never stores the login token
- **Where:** [client/src/pages/Login.jsx:24](../client/src/pages/Login.jsx#L24) — stores only `user`; the returned `token` is discarded.
- [client/src/utils/axios.js:14](../client/src/utils/axios.js#L14) reads `localStorage.getItem('token')`, which is therefore always `null` → the storefront never sends an `Authorization` header.
- Currently masked only because of critical issue #1; the moment auth is enforced, every storefront call breaks.

### 8. Admin logout leaves the real credential behind
- **Where:** [AdminHeader.jsx:39-40](../admin/src/components/layout/AdminHeader.jsx#L39) removes `token` and `user`, but **not `authToken`**.
- [admin/src/services/api.js:6](../admin/src/services/api.js#L6) is what actually sends the header, and it reads `authToken`. The token survives logout.
- Root cause is that [admin Login.jsx:42-43](../admin/src/pages/Login.jsx#L42) writes the token under **two** keys (`authToken` and `token`) that are consumed by two different HTTP layers.

### 9. 401 redirect targets a route that doesn't exist
- **Where:** [client/src/utils/axios.js:49](../client/src/utils/axios.js#L49) — `window.location.href = '/login'`
- The storefront has no `/login` route; login lives at `/my-account` ([App.jsx:62](../client/src/App.jsx#L62)). A 401 sends the user to the NotFound page.

### 10. Storefront logout is incomplete
- **Where:** [Header.jsx:134](../client/src/components/Header.jsx#L134) — removes only `user`, leaving `token` behind.
- `userSlice.logout` clears both, but Header doesn't use it — two divergent logout implementations.

---

## 🔵 Low / inconsistencies

### 11. Dead and broken duplicate login endpoint
- [server/routes/auth.js](../server/routes/auth.js) + [authController.js](../server/controllers/authController.js) implement a second login at `/api/auth/login`.
- It is **never mounted** in [index.js](../server/index.js) (no `app.use('/api/auth', ...)`), and it's broken regardless:
  - queries `SELECT * FROM users` and compares `user.password`, but passwords live in the `credentials` table;
  - signs `{ id: user.id }` while the primary key is `user_id`.

**Fix:** delete both files.

### 12. Registration is not atomic
- **Where:** [userController.js:357-384](../server/controllers/userController.js#L357)
- The `users` insert and the `credentials` insert are separate statements with no transaction. A failure between them leaves an orphaned `users` row.
- Partially mitigated by the new recovery branch (#3 in "Recently fixed"), but the write should still be wrapped in a transaction.

### 13. No password validation on register
- **Where:** [userController.js:301](../server/controllers/userController.js#L301) / [:374](../server/controllers/userController.js#L374)
- A missing `password` makes `bcrypt.hash(undefined, ...)` throw → generic 500 `Internal Server Error` instead of a 400.

### 14. Password rules are inconsistent across forms
- [ResetPassword.jsx:57-80](../client/src/pages/ResetPassword.jsx#L57) enforces min 6 characters **and** a confirm-password field.
- [Signup.jsx:111-116](../client/src/pages/Signup.jsx#L111) enforces neither — any non-empty password is accepted, with no confirmation field.
- The server enforces min 6 on reset ([line 634](../server/controllers/userController.js#L634)) but nothing on register.

### 15. Signup collects fewer fields than the schema expects
- [Signup.jsx:54-63](../client/src/pages/Signup.jsx#L54) sends only `username`, `email`, `password`.
- `registerUser` also expects `first_name`, `last_name`, `address` — all inserted as `NULL`, so the welcome email greets `Hi ,` ([userController.js:74](../server/controllers/userController.js#L74)) and the admin Users/Customers tables show blank names.

### 16. Signup does not auto-login
- The register response returns no token or user object, so [Signup.jsx:67](../client/src/pages/Signup.jsx#L67) redirects to `/my-account` and the user must log in manually. Functional, but worth a deliberate decision.

### 17. Duplicate success toasts on login
- [client/src/pages/Login.jsx:50](../client/src/pages/Login.jsx#L50) and [:53](../client/src/pages/Login.jsx#L53) both fire a success toast ("Welcome back, …" and "Logged in successfully!"). Same duplication in [admin Login.jsx:47](../admin/src/pages/Login.jsx#L47) and [:50](../admin/src/pages/Login.jsx#L50).

### 18. Admin route protection is client-side only
- **Where:** [admin/src/App.jsx:22-29](../admin/src/App.jsx#L22) — `Protected` trusts `localStorage.user.is_admin`.
- Editing one localStorage value grants full admin UI access. Only meaningful once the server actually enforces auth (issue #1).

### 19. `resetPassword` ignores account state
- **Where:** [userController.js:648-657](../server/controllers/userController.js#L648)
- Updates `credentials` by `user_id` without checking `is_registered`, so a password can be set on an account that login would then reject with `403 User is not registered`.

---

## Suggested order of work

1. **Issues #1 and #2** — the two criticals; both are small, contained changes.
2. **#5, #6, #4** — quick reset-flow cleanups (toast bug, debug logs, the 500 enumeration leak).
3. **#7, #8, #9, #10** — token storage and logout consistency; do these together, since they're one coherent "where does the token live" problem.
4. **#3** — replayable reset tokens; needs a schema decision first.
5. **#11-#19** — hygiene and consistency.
