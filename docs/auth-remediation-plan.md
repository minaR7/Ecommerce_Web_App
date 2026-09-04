# Auth Remediation Plan — Login, Signup & Password

Fix plan with implementation code for every issue in [login-signup-and-password.md](./login-signup-and-password.md).

Work is grouped into phases because **the order matters**: enforcing server-side auth (#1) before the storefront actually sends a token (#7) would break every logged-in customer flow. Each phase is independently shippable.

> Line numbers refer to the state at commit `bc7a9e5` and will drift as you apply edits. Work top-down within a file, or match on the surrounding code rather than the line number.

---

## Phase 0 — Cleanup (no behavior change, no risk)

### #11 Delete dead code

Verified unreferenced — safe to delete outright:

- **[server/routes/auth.js](../server/routes/auth.js)** and **[server/controllers/authController.js](../server/controllers/authController.js)** — never mounted in `index.js`; the route file's only inbound reference is its own `require` of the controller.
- **[client/src/redux/slices/userSlice.js](../client/src/redux/slices/userSlice.js)** — *(additional find)* not registered in [store.js](../client/src/redux/store.js) (which holds only `products`, `cart`, `wishlist`), and nothing imports its `loginUser` or `logout`. Its thunk posts to the dead `/api/auth/login`, and its copy of `getLoggedInUser` is shadowed by the real one in [utils/getLoggedInUser.js](../client/src/utils/getLoggedInUser.js), which is what `cartSlice`, `wishlistSlice` and `migrateGuestCartToUser` actually import.

### #6 + #5 Strip debug logging and fix the toast

**[server/controllers/userController.js:26-47](../server/controllers/userController.js#L26)** — drop the config log and the verbose SMTP transcript:

```js
const makeTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
    tls: { rejectUnauthorized: true },
  });
```

**[userController.js:93-140](../server/controllers/userController.js#L93)** — the clean version already exists, commented out, at [lines 79-91](../server/controllers/userController.js#L79). Delete the noisy implementation (its `await transporter.verify()` costs a full extra SMTP round-trip on every reset) and uncomment that block. Also delete the commented-out duplicate `makeTransporter` at [lines 49-66](../server/controllers/userController.js#L49).

**[userController.js:581-627](../server/controllers/userController.js#L581)** — remove every `console.log` in `forgotPassword` (they log submitted emails and full recordsets). Keep only the `console.error` calls.

**[client/src/pages/ForgotPassword.jsx:11-71](../client/src/pages/ForgotPassword.jsx#L11)** — delete both the commented-out block and the numbered-log implementation, replacing them with one clean version. This also fixes **#5** (`response.message` → `response.data.message`):

```jsx
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_SERVER_URL}/api/users/forgot-password`,
        { email: values.email }
      );
      setSent(true);
      toast.success(res.data?.message || 'If that email is registered, a reset link has been sent.');
    } catch (err) {
      if (!err.response) {
        toast.error('Network error: unable to reach the server. Please try again.');
      } else {
        toast.error(err.response.data?.error || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
```

### #17 Remove duplicate success toasts

Delete the redundant second toast in each file — keep the personalized "Welcome back" one:

- [client/src/pages/Login.jsx:53](../client/src/pages/Login.jsx#L53) — delete `toast.success('Logged in successfully!');`
- [admin/src/pages/Login.jsx:50](../admin/src/pages/Login.jsx#L50) — delete the same line.

---

## Phase 1 — Server hardening (safe: no client contract changes)

All edits in [server/controllers/userController.js](../server/controllers/userController.js).

### #2 🔴 Stop accepting `is_admin` from the register body

**[Line 235](../server/controllers/userController.js#L235)** — drop it from the destructure:

```js
  const { first_name, last_name, email, address, password, username } = req.body;
```

**[Line 332-336](../server/controllers/userController.js#L332)** (existing-user path) and **[line 379](../server/controllers/userController.js#L379)** (new-user path) — hardcode `false`:

```js
  credentialRequest.input('is_admin', sql.Bit, false);
```

Admin promotion then exists only in `updateUser`, which Phase 3 puts behind `requireAdmin`.

### #13 Validate the register payload

Insert at the very top of `registerUser`, before the DNS lookup and any DB work:

```js
exports.registerUser = async (req, res) => {
  const { first_name, last_name, email, address, password, username } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ error: 'Username, email and password are required' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  // ...existing body
```

Prevents the current `bcrypt.hash(undefined)` throw → opaque 500.

### #4 Close the enumeration leak in forgot-password

**[Lines 612-617](../server/controllers/userController.js#L612)** — log the failure but fall through to the generic 200, so unknown email / known email / mail failure are indistinguishable:

```js
      try {
        await sendPasswordResetEmail({ email: user.email, resetUrl });
      } catch (mailErr) {
        // Log only. Returning 500 here would disclose that the address is registered.
        console.error('Failed to send reset email:', mailErr);
      }
```

### #19 Make reset respect account state

In `resetPassword`, **[lines 648-657](../server/controllers/userController.js#L648)**, confirm the account exists and is registered before writing:

```js
    const request = new sql.Request();
    request.input('id', sql.Int, payload.id);

    const accountRes = await request.query(`
      SELECT TOP 1 u.user_id
      FROM users u
      JOIN credentials c ON u.user_id = c.user_id
      WHERE u.user_id = @id AND u.is_registered = 1
    `);
    if (accountRes.recordset.length === 0) {
      return res.status(400).json({ error: 'Account not found for this reset link.' });
    }

    const hash = await bcrypt.hash(String(password), saltRounds);
    request.input('password', sql.VarChar, hash);
    await request.query(`UPDATE credentials SET password = @password WHERE user_id = @id`);

    return res.status(200).json({ message: 'Password updated successfully. You can now log in.' });
```

### #12 Wrap registration in a transaction

Replace the new-user path, **[lines 352-397](../server/controllers/userController.js#L352)**. Note each request must be bound to the transaction via `new sql.Request(tx)`, and side effects must run only after commit:

```js
    // User doesn't exist → create users + credentials atomically.
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const tx = new sql.Transaction();
    await tx.begin();

    let user_id;
    try {
      const userReq = new sql.Request(tx);
      userReq.input('email', sql.VarChar, email);
      userReq.input('first_name', sql.VarChar, first_name);
      userReq.input('last_name', sql.VarChar, last_name);
      userReq.input('address', sql.VarChar, address);
      userReq.input('is_registered', sql.Bit, true);

      const userResult = await userReq.query(`
        INSERT INTO users (first_name, last_name, email, address, is_registered, created_at, updated_at)
        OUTPUT inserted.user_id
        VALUES (@first_name, @last_name, @email, @address, @is_registered, GETDATE(), GETDATE())
      `);
      user_id = userResult.recordset[0].user_id;

      const credReq = new sql.Request(tx);
      credReq.input('user_id', sql.Int, user_id);
      credReq.input('email', sql.VarChar, email);
      credReq.input('username', sql.VarChar, username);
      credReq.input('hashedPassword', sql.VarChar, hashedPassword);
      credReq.input('is_admin', sql.Bit, false);

      await credReq.query(`
        INSERT INTO credentials (user_id, email, username, password, is_admin)
        VALUES (@user_id, @email, @username, @hashedPassword, @is_admin)
      `);

      await tx.commit();
    } catch (e) {
      await tx.rollback();
      throw e;
    }

    // Side effects only once the data is durably committed.
    try {
      await notifyAdmins({
        type: 'user_registered',
        title: 'New user registered',
        message: `${email} registered`,
        meta: { userId: user_id, email },
      });
    } catch {}
    try {
      await sendSignupEmail({ email, first_name });
    } catch {}

    return res.status(201).json({ message: 'User registered successfully', user_id });
```

Keep the existing "user exists without credentials" recovery branch — it repairs rows orphaned before this fix.

---

## Phase 2 — Token plumbing (prerequisite for Phase 3)

### #8 Admin: settle on one storage key

Verified: **[admin/src/utils/axios.js](../admin/src/utils/axios.js) is imported by nothing** — the admin app talks to the API exclusively through [services/api.js](../admin/src/services/api.js), which reads `authToken`.

1. **Delete** `admin/src/utils/axios.js`.
2. **[admin/src/pages/Login.jsx:41-44](../admin/src/pages/Login.jsx#L41)** — drop the duplicate key:

```js
      if (token) {
        localStorage.setItem('authToken', token);
      }
```

3. **[AdminHeader.jsx:37-43](../admin/src/components/layout/AdminHeader.jsx#L37)** — clear the key that's actually used:

```js
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };
```

### #7 Storefront: actually store the token

**[client/src/pages/Login.jsx:23-24](../client/src/pages/Login.jsx#L23)**:

```js
      const user = loginRes.data.data;
      const token = loginRes.data.token;
      localStorage.setItem('user', JSON.stringify(user));
      if (token) localStorage.setItem('token', token);
```

**Carry into Phase 3:** [Login.jsx](../client/src/pages/Login.jsx), [Signup.jsx](../client/src/pages/Signup.jsx) and [ForgotPassword.jsx](../client/src/pages/ForgotPassword.jsx) import bare `axios`, not the configured instance at [client/src/utils/axios.js](../client/src/utils/axios.js) — only the instance attaches `Authorization`. Any storefront call that becomes protected must be migrated to the instance.

### #10 Storefront: complete the logout

`userSlice.logout` can't be reused — that slice is dead code being deleted in #11. Fix `Header.handleLogout` directly. Header already has `useDispatch` ([line 109](../client/src/components/Header.jsx#L109)) and imports from `cartSlice` ([line 99](../client/src/components/Header.jsx#L99)), so only `clearCart` needs adding to that import:

```js
import { openDrawer, closeDrawer, clearCart } from '../redux/slices/cartSlice';
```

```js
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    dispatch(clearCart());   // don't leak the previous user's cart to the next visitor
    navigate('/');
  };
```

### #9 Fix the dead 401 redirect

**[client/src/utils/axios.js:43-50](../client/src/utils/axios.js#L43)** — the storefront has no `/login` route:

```js
      if (error.response.status === 401)
      {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/my-account';
      }
```

---

## Phase 3 — Enforce authentication (the critical fix)

### #1 🔴 Apply `verifyToken` to routes

[server/middleware/auth.js](../server/middleware/auth.js) already works and populates `req.user = { id, is_admin }`. It just needs to be used.

**Step 1 — new file `server/middleware/requireAdmin.js`:**

```js
// Must run after verifyToken, which populates req.user from the JWT.
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

module.exports = requireAdmin;
```

**Step 2 — protect admin mutations first.** Highest-risk, and the admin app already sends `Authorization` after Phase 2, so nothing breaks. Apply **per-route**, not at the `app.use` level, so public GETs in the same router stay open. [server/routes/shipping.js](../server/routes/shipping.js) as the template:

```js
const express = require('express');
const controller = require('../controllers/shippingRatesController');
const verifyToken = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const router = express.Router();

// Public — the storefront Cart and Checkout pages read rates anonymously.
router.get('/', controller.getAll);
router.get('/:country', controller.getByCountry);

// Admin only.
router.post('/', verifyToken, requireAdmin, controller.create);
router.put('/:id', verifyToken, requireAdmin, controller.update);
router.delete('/:id', verifyToken, requireAdmin, controller.remove);

module.exports = router;
```

Repeat that split for the write routes on `products`, `categories`, `subcategories`, `colors`, `sizes`, `coupons`, `pages`, `orders`, `notifications`, and `site-settings` (`PUT /` + uploads admin-only, `GET /` public).

[server/routes/userRoutes.js](../server/routes/userRoutes.js) in full:

```js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

// Public auth endpoints.
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/check-email', userController.checkEmail);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// Any authenticated user.
router.get('/me', verifyToken, userController.getMe);

// Admin only.
router.get('/', verifyToken, requireAdmin, userController.getUsers);
router.get('/customers', verifyToken, requireAdmin, userController.getCustomers);
router.put('/:id', verifyToken, requireAdmin, userController.updateUser);
router.delete('/:id', verifyToken, requireAdmin, userController.deleteUser);

module.exports = router;
```

**Step 3 — customer routes.** Only after Phase 2 ships and storefront calls use the axios instance. Guest cart and guest checkout must stay public — gate on whether the request carries a `user_id` rather than blanket-protecting `/api/cart` and `/api/checkout`.

**Step 4 — permanently public:** login, register, check-email, forgot-password, reset-password, and all product/category browsing.

### #18 Give the admin guard real teeth

**New controller in [userController.js](../server/controllers/userController.js)** — identity comes from the token, never the request body:

```js
exports.getMe = async (req, res) => {
  try {
    const request = new sql.Request();
    request.input('id', sql.Int, req.user.id);
    const result = await request.query(`
      SELECT TOP 1 u.user_id, u.email, c.username, c.is_admin
      FROM users u
      JOIN credentials c ON u.user_id = c.user_id
      WHERE u.user_id = @id
    `);
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
```

**Admin client** — `fetchApi` is an internal helper in [services/api.js](../admin/src/services/api.js), so add a method to the exported `usersApi` object ([line 264](../admin/src/services/api.js#L264)):

```js
  getMe: () => fetchApi('/users/me'),
```

**[admin/src/App.jsx:22-29](../admin/src/App.jsx#L22)** — verify against the server instead of trusting localStorage:

```jsx
const Protected = ({ children }) => {
  const [state, setState] = useState('checking');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await usersApi.getMe();
        if (!cancelled) setState(me?.is_admin ? 'ok' : 'denied');
      } catch {
        if (!cancelled) setState('denied');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (state === 'checking') return <div style={{ padding: 24 }}>Checking access…</div>;
  if (state === 'denied') return <Navigate to="/login" replace />;
  return children;
};
```

Requires adding `useState, useEffect` and `usersApi` imports. The client check stays a UX convenience — Step 2 is what actually enforces access.

---

## Phase 4 — Schema change

### #3 Make reset tokens single-use

One new column gets single-use tokens *and* invalidation of concurrently-issued links:

```sql
ALTER TABLE credentials ADD password_changed_at DATETIME NULL;
```

Then extend the `resetPassword` block from #19 — every JWT already carries `iat`, so the token format doesn't change:

```js
    const accountRes = await request.query(`
      SELECT TOP 1 u.user_id, c.password_changed_at
      FROM users u
      JOIN credentials c ON u.user_id = c.user_id
      WHERE u.user_id = @id AND u.is_registered = 1
    `);
    if (accountRes.recordset.length === 0) {
      return res.status(400).json({ error: 'Account not found for this reset link.' });
    }

    // Single-use: any token issued before the last password change is dead.
    const changedAt = accountRes.recordset[0].password_changed_at;
    if (changedAt && payload.iat * 1000 < new Date(changedAt).getTime()) {
      return res.status(400).json({ error: 'This reset link is invalid or has expired.' });
    }

    const hash = await bcrypt.hash(String(password), saltRounds);
    request.input('password', sql.VarChar, hash);
    await request.query(`
      UPDATE credentials
      SET password = @password, password_changed_at = GETDATE()
      WHERE user_id = @id
    `);
```

A replayed link then has an `iat` older than `password_changed_at` and is refused.

**Optional follow-up:** apply the same check to login tokens to force logout-everywhere on password change. Larger blast radius — separate work.

---

## Phase 5 — Signup UX & consistency

All in [client/src/pages/Signup.jsx](../client/src/pages/Signup.jsx).

### #15 + #14 Collect the expected fields, align password rules

Add name inputs above the username field (fixes the `Hi ,` welcome email and blank admin table names), and mirror the password rules from [ResetPassword.jsx:55-80](../client/src/pages/ResetPassword.jsx#L55):

```jsx
          <Form.Item name="first_name" rules={[{ required: true, message: 'Please input your first name!' }]}>
            <Input placeholder="First name" />
          </Form.Item>

          <Form.Item name="last_name" rules={[{ required: true, message: 'Please input your last name!' }]}>
            <Input placeholder="Last name" />
          </Form.Item>
```

```jsx
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters.' },
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Form.Item
            name="confirm"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject(new Error('The two passwords do not match.'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm password" />
          </Form.Item>
```

And include the names in the POST body ([lines 56-63](../client/src/pages/Signup.jsx#L56)):

```js
        {
          first_name: values.first_name,
          last_name: values.last_name,
          username: values.username,
          email: values.email,
          password: values.password,
        }
```

### #16 Auto-login after signup — *product decision*

Skip this if you'd rather users log in explicitly; the current behavior is then correct.

To enable it, return the same shape as `loginUser` from `registerUser` (replacing the `201` response in the Phase 1 #12 block):

```js
    const token = jwt.sign({ id: user_id, is_admin: false }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return res.status(201).json({
      message: 'User registered successfully',
      data: { user_id, username, email, is_admin: false },
      token,
    });
```

And consume it in [Signup.jsx:65-67](../client/src/pages/Signup.jsx#L65):

```js
      const user = res.data.data;
      localStorage.setItem('user', JSON.stringify(user));
      if (res.data.token) localStorage.setItem('token', res.data.token);
      window.dispatchEvent(new Event('user-login'));
      toast.success('Account created successfully');
      navigate('/');
```

---

## Verification

- **Phase 0-1:** register with `is_admin: true` in the body → account must not be admin; POST forgot-password for a known email, an unknown email, and with SMTP broken → all three return an identical 200; register with a 3-char and a missing password → 400, not 500; kill the DB between the two register inserts → no orphaned `users` row.
- **Phase 2:** log in on both apps and confirm the token lands under the expected key; log out and confirm no `token`/`authToken`/`user` remains; trigger a 401 → storefront lands on `/my-account`.
- **Phase 3:** call each protected endpoint with no token → 401; with a non-admin token → 403; then walk the admin UI end to end, plus the storefront guest browse → add to cart → guest checkout path.
- **Phase 4:** complete a reset, then replay the same link → "invalid or has expired"; request two links, use the newer → older is refused.
- **Phase 5:** sign up and confirm names reach the DB, the welcome email is addressed correctly, and mismatched passwords are rejected client-side.
