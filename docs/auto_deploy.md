# Deploy to Plesk (Windows / IIS) — Setup Guide

Two different flows, on purpose:

- **Frontends (`client/`, `admin/`) — MANUAL.** You build locally and upload the `dist/` folder
  yourself over FTP / File Manager. No CI involvement.
- **Backend (`server/`) — AUTOMATED.** Push to the `prod` branch with changes under `server/` →
  GitHub Actions uploads the server code to `api.elmaghrib.com` over **FTP**. Full version control,
  push-to-deploy.

> **Environment:** Windows Plesk + IIS. Node.js (v22.17.1) runs under **iisnode**, not Passenger.
> There is **no SSH** — transport is **FTP**. No Git extension needed.

## Architecture — three targets, one home directory

| App | Type | Plesk location | URL | Deploy |
|---|---|---|---|---|
| `client/` | static SPA | `elmaghrib.com` → `/httpdocs` | `https://elmaghrib.com` | **manual** |
| `admin/` | static SPA | `admin.elmaghrib.com` → `/httpdocs/adminpanel` | `https://admin.elmaghrib.com` | **manual** |
| `server/` | Node (iisnode) | `api.elmaghrib.com` → `/api.Elmaghrib.com/` | `https://api.elmaghrib.com` | **auto (CI)** |

The API lives on its own subdomain so the automated deploy writes to a single isolated folder —
no overlap with the frontends, and the socket.io server is separated from the static SPAs.

---

## Frontend flow (manual) — how you ship client / admin

1. Make sure the build env points at the API subdomain. In `client/.env` and `admin/.env`:
   ```
   VITE_BACKEND_SERVER_URL=https://api.elmaghrib.com
   ```
   (plus `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_ADMIN_BASE_URL`, and `VITE_API_URL` if referenced).
2. Build:
   ```
   cd client && npm run build      # -> client/dist/
   cd admin  && npm run build      # -> admin/dist/
   ```
   Each build auto-includes its `public/web.config` (IIS SPA routing) in `dist/`.
3. Upload the **contents of `dist/`** over FTP / Plesk File Manager:
   - `client/dist/*` → `/httpdocs/` (leave the `adminpanel/` subfolder untouched)
   - `admin/dist/*`  → `/httpdocs/adminpanel/`

> Sanity check after a build: search the built JS for `api.elmaghrib.com` to confirm the API URL
> baked in. Hard-refresh the site after upload (Ctrl+F5) to bypass cached assets.

---

## Backend flow (automated) — one-time setup

### Step 0 — iisnode port (DONE in code)

`server/index.js` now listens on `process.env.PORT || 3005` — iisnode assigns the port. Without
this the backend won't run under Plesk's Node.js on Windows.

### Step 1 — API subdomain + Node.js (DONE in Plesk)

- `api.elmaghrib.com` exists and **Node.js is now enabled** on it. ✅
- Confirm in its **Node.js** panel: **Application Root** = `/api.Elmaghrib.com/` (the deploy target),
  **Application Startup File** = `index.js`, **Mode** = production.
- Add a **Let's Encrypt** cert for the subdomain if not already issued (Security → SSL/TLS), so the
  API is served over `https://`.
- Put runtime secrets in the panel's **Environment variables**, or upload a `.env` to the app root
  manually — it is gitignored and **never** touched by CI.
- After the first deploy, click **NPM install** in this panel so `bcrypt`/`mssql` compile on the
  server. Re-run it only when `server/package.json` deps change.

### Step 2 — FTP credentials

From the domain's **Dashboard → Files & Databases → Connection Info** (host, user, password).
`elmaghrib.com` and `api.elmaghrib.com` share one home directory and one system user (`Elmaghrib`),
so a **single FTP account reaches the server target**. The api docroot is `/api.Elmaghrib.com/` —
Plesk's Windows subdomain convention, *not* `httpdocs`.

### Step 3 — GitHub repository secrets

GitHub repo → **Settings → Secrets and variables → Actions**. Backend deploy only needs FTP:

| Secret | Example |
|---|---|
| `FTP_SERVER` | `212.95.42.78` (or `ftp.elmaghrib.com`) |
| `FTP_USERNAME` | Plesk FTP account (system user `Elmaghrib`) |
| `FTP_PASSWORD` | its password |
| `SERVER_DIR` | `/api.Elmaghrib.com/` |

> The `VITE_*` secrets are no longer needed in CI — the frontends build on your machine.
> ⚠️ The **server `.env` stays on the server only** — CI never uploads or overwrites it.

### Step 4 — The workflow (`.github/workflows/deploy.yml`)

One job, `SamKirkland/FTP-Deploy-Action`. Triggers on push to `prod` **only when `server/**` (or the
workflow file) changes**, plus manual `workflow_dispatch`. It FTPs `server/` → `SERVER_DIR`, excluding:

- `**/node_modules/**` — installed on the server via the Plesk **NPM install** button
- `.env`, `.user.ini`, `web.config` — server-only / IIS config, managed on the server
- `assets/uploads/**` — **user-uploaded images; never delete or overwrite**
- runtime-written data: `data/**`, `logs/**`, `iisnode_logs/**`, `invoices/**`

**Restart:** iisnode reloads when app files change (re-uploading `index.js` triggers it). If a
deploy doesn't pick up, use Plesk → Node.js → **Restart App**.

---

## Files in the repo (done)

- `server/index.js` — listens on `process.env.PORT` (iisnode requirement).
- `.nvmrc` — pins Node 22 to match the server's `22.17.1`.
- `client/public/web.config`, `admin/public/web.config` — SPA routing for IIS, auto-copied into each
  `dist/` at build time (used by the **manual** frontend uploads).
- `.github/workflows/deploy.yml` — the **server-only** FTP pipeline (triggers on push to `prod`
  touching `server/`).
- `.gitignore` — added `.playwright-browsers/` and `test-results.txt`.

### How the live web.config works today (confirmed)

The current `/httpdocs/web.config` proves client and server share one docroot:

1. **API Proxy** rule — `^api/(.*)` → rewrite to `index.js`, handled by the `<handlers>` `iisnode`
   entry. This is how the backend is served *today* from `/httpdocs`.
2. **Store SPA** rule — everything that isn't a real file/folder → `index.html` (the client SPA).
3. Plus Plesk-managed `<httpErrors>`, `<tracing>`, and an ASP.NET `compilation tempDirectory`.

`client/public/web.config` is a faithful copy of this **minus** the API Proxy rule and the iisnode
handler, since the backend now lives on `api.elmaghrib.com`. Error-doc / tracing / temp-dir blocks
are preserved so the manual upload doesn't silently drop them.

> **Ordering matters:** uploading the client `web.config` removes the `/api → index.js` route on
> `elmaghrib.com`. Only upload it **after** `https://api.elmaghrib.com/api/products` is confirmed
> working, otherwise the old backend route disappears before the new one is proven live.

> **Before the first admin upload:** check `/httpdocs/adminpanel/web.config` in File Manager. If it
> has its own Plesk `<httpErrors>` block, copy it into `admin/public/web.config` first — that file
> is not yet adapted because its current contents haven't been inspected.

---

## One-time migration — zero downtime (get the server off /httpdocs)

Current state: `elmaghrib.com/httpdocs` holds the **server** (`index.js`, `node_modules`,
`controllers/`, `routes/`, `assets/uploads`, `.env`, `web.config`), the **client** (`index.html` +
`assets/`), the **admin** (`adminpanel/`), plus leftover clutter (`store/`, `backendserver/`, `css/`,
`App_Data/`, `generate_secret.js`, `*.cer`). Migrate the API onto its own subdomain while the old
site keeps running:

1. **`api.elmaghrib.com` + Node.js** — DONE. ✅ Confirm Application Root / Startup File / SSL per
   Step 1 above.
2. **Get the server code there** — run the CI deploy (push to `prod`, or Actions → *Run workflow*),
   which FTPs `server/` into `/api.Elmaghrib.com/`. Add the `.env` manually (not committed). Click
   **NPM install** in the subdomain's Node.js panel.
3. **Verify in isolation:** `https://api.elmaghrib.com/api/products` returns JSON. The old site is
   untouched at this point, so there is no downtime.
4. **Flip the frontends:** set `VITE_BACKEND_SERVER_URL=https://api.elmaghrib.com` in the frontend
   `.env`s, rebuild locally, and upload both `dist/`s (manual frontend flow above).
5. **Clean `elmaghrib.com/httpdocs`** so it's client-only: in File Manager delete the server files
   /folders (`index.js`, `package.json`, `node_modules`, `controllers`, `routes`, `services`,
   `sockets`, `middleware`, `data`, `dbconfig.js`, `generate_secret.js`, `*.cer`, `store`,
   `backendserver`, `css`, `App_Data`, `iisnode_logs`) and disable Node.js on `elmaghrib.com`.
   Keep only the client build (`index.html`, `assets/`, `web.config`) and the `adminpanel/` folder.
   > Do this **after** step 4 succeeds. Then the client/server `assets/` collision is gone (uploads
   > now live under `api.elmaghrib.com`'s `assets/uploads`).
6. **`admin.elmaghrib.com`:** it's a static SPA — make sure its (broken/unused) Node.js app is
   disabled so IIS serves the static admin build. Disabling it also freed the Node slot that
   `api.elmaghrib.com` now uses.

---

## Security note — `.env` sits inside a web docroot

The server's `.env` lives in `/api.Elmaghrib.com/`, a **web-accessible folder**. The SPA rewrite
only redirects requests that are *not* real files, so a real file like `.env` is passed to IIS. IIS
normally returns `404.3` for extensions with no MIME mapping, which is why this hasn't leaked.

**Verify it:** open `https://api.elmaghrib.com/.env` (and `https://elmaghrib.com/.env`) — you should
get a 404, **not** a download. If it downloads, add request filtering to that docroot's `web.config`:

```xml
<security>
  <requestFiltering>
    <hiddenSegments>
      <add segment=".env" />
      <add segment="node_modules" />
    </hiddenSegments>
    <fileExtensions>
      <add fileExtension=".env" allowed="false" />
    </fileExtensions>
  </requestFiltering>
</security>
```

Better long-term: set the Node.js **Application Root** to a folder *outside* the docroot (the home
directory already has a `nodeapp/` folder) so app code and secrets are never web-served.

---

## Verification

1. **Backend live:** `GET https://api.elmaghrib.com/api/products` returns JSON; Node.js panel shows
   the app running.
2. **Auto-deploy:** push a trivial change under `server/` to `prod`; the *Deploy server to Plesk*
   Action goes green and the change is live after iisnode reloads.
3. **Upload safety:** an existing image under `assets/uploads/` still loads after a backend deploy
   (that folder is excluded from CI).
4. **Frontends:** after a manual rebuild + upload, hard-refresh `https://elmaghrib.com` and
   `https://admin.elmaghrib.com`; network calls hit `https://api.elmaghrib.com`.
5. **Secret check:** `https://api.elmaghrib.com/.env` → 404, not a download.
