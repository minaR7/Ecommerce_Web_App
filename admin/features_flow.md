# Admin Panel — Features & Flows

React + Vite + Ant Design (dark theme) + TanStack Query + Socket.IO client. It manages the catalogue, orders, users, coupons, shipping, CMS pages and site content.
Routes: [src/App.jsx](src/App.jsx). API layer: [src/services/api.js](src/services/api.js) (`fetchApi` sends `Authorization: Bearer authToken`). Layout: [src/components/layout/](src/components/layout/).

Each section has four diagrams:

1. **Architecture overview**: the pages, components and APIs involved
2. **Action-loop workflow**: admin action → API → state → re-render, repeated
3. **Sequence**: the call order between the admin, the UI and the server
4. **Events / data flow**: what data, storage keys and socket events move where

---

## Contents

- [0. Whole admin panel](#0-whole-admin-panel)
- [1. Auth & route protection](#1-auth--route-protection)
- [2. Dashboard](#2-dashboard)
- [3. Catalog management (Categories, Subcategories, Products, Colors, Sizes)](#3-catalog-management)
- [4. Orders](#4-orders)
- [5. Users & Customers](#5-users--customers)
- [6. Coupons](#6-coupons)
- [7. Shipping rates](#7-shipping-rates)
- [8. CMS Pages & Site Content](#8-cms-pages--site-content)
- [9. Real-time notifications](#9-real-time-notifications)
- [Notes from the code](#notes-from-the-code)

---

## 0. Whole admin panel

### Architecture overview

```mermaid
flowchart LR
    subgraph Browser["Admin browser"]
        subgraph Shell["AdminLayout"]
            SB["AdminSidebar (NavLink)"]
            HD["AdminHeader: notifications bell, profile, logout"]
        end
        PR["Protected wrapper (user.is_admin)"]
        PG["Pages: Dashboard, Categories, Subcategories, Products, Orders, Users, Customers, Coupons, Shipping, Pages, PageEditor, SiteContent"]
        QC["TanStack QueryClient (Pages, PageEditor)"]
        API["services/api.js fetchApi + FormData uploads"]
        LS[("localStorage: user, token, authToken")]
        IOC["socket.io-client"]
    end
    SRV["Express API /api/*"]
    WS["Socket.IO server (room admins)"]

    PR --> Shell --> PG
    PG --> API
    PG --> QC --> API
    API --> LS
    API -->|REST + multipart| SRV
    HD --> IOC <-->|new-notification| WS
    HD --> API
```

### Action-loop workflow (generic CRUD page)

```mermaid
flowchart TD
    A([page mounts]) --> B["xxxApi.getAll()"] --> C["setState list / query cache"] --> D["render AntD Table"]
    D --> E([Add / Edit / Delete]) --> F{"action"}
    F -- "add / edit" --> G["open Modal + Form"] --> H{"valid?"}
    H -- no --> G
    H -- yes --> I["create / update (JSON or FormData with images)"]
    F -- delete --> J["Popconfirm"] --> K["delete(id)"]
    I & K --> L{"ok?"}
    L -- no --> M["toast / message.error"]
    L -- yes --> N["toast success"] --> B
    M --> D
```

### Sequence (admin session)

```mermaid
sequenceDiagram
    actor A as Admin
    participant UI as Admin UI
    participant API as Server
    participant IO as Socket.IO

    A->>UI: /login credentials
    UI->>API: POST /api/users/login (x-admin-request)
    API-->>UI: user (is_admin) + token
    UI->>UI: store user, token, authToken then navigate /
    UI->>API: GET /api/orders/stats, /api/orders, /api/products/best-sellers
    UI->>API: GET /api/notifications/unread
    UI->>IO: connect auth token
    IO-->>UI: new-notification (live)
    A->>UI: manage products / orders / content
    UI->>API: CRUD calls
```

### Events / data flow

```mermaid
flowchart LR
    LG["Login"] --> K1[("user")] & K2[("token")] & K3[("authToken")]
    K1 --> PR["Protected route guard"]
    K3 --> FA["fetchApi Bearer"]
    K3 --> SK["socket auth"]
    K2 --> AX["axios instance Bearer"]
    FA --> SRV["/api/*"]
    SRV --> DBW[("SQL Server writes")]
    DBW -->|notifyAdmins| EV(("new-notification"))
    EV --> BELL["AdminHeader bell"]
    SC["SiteContent"] --> JSON[/"site_settings.json"/] --> STORE["Storefront"]
```

---

## 1. Auth & route protection

Files: [src/pages/Login.jsx](src/pages/Login.jsx), `Protected` in [src/App.jsx](src/App.jsx), logout in [src/components/layout/AdminHeader.jsx](src/components/layout/AdminHeader.jsx).

### Architecture overview

```mermaid
flowchart LR
    LG["Login page"] -->|POST /api/users/login| API["Server"]
    LG --> LS[("localStorage user, token, authToken")]
    PR["Protected"] -->|reads| LS
    PR -->|not admin| LG
    HD["AdminHeader logout"] -->|clear| LS
```

### Action-loop workflow

```mermaid
flowchart TD
    A([open any route]) --> B{"localStorage.user.is_admin?"}
    B -- yes --> C["render page in AdminLayout"]
    B -- no --> D["Navigate /login"]
    D --> E([submit credentials]) --> F["POST /api/users/login"]
    F --> G{"ok and is_admin?"}
    G -- no --> H["error: not an admin / invalid"] --> E
    G -- yes --> I["save user, token, authToken"] --> J["navigate /"] --> C
    C --> K([logout]) --> L["remove token + user"] --> D
```

### Sequence

```mermaid
sequenceDiagram
    actor A as Admin
    participant L as Login
    participant API as Server
    participant LS as localStorage
    participant P as Protected
    A->>L: username + password
    L->>API: POST /api/users/login identifier, password
    API-->>L: user + token (is_admin)
    L->>LS: user, authToken, token
    L->>P: navigate /
    P->>LS: read user
    P-->>A: Dashboard
```

### Events / data flow

```mermaid
flowchart LR
    F["login form"] --> R["user + JWT (id, is_admin, 1 day)"]
    R --> U[("user")] --> G["Protected guard"]
    R --> T[("authToken / token")] --> H["Authorization header + socket auth"]
    H -->|"401 from axios"| CLR["remove token, redirect /login"]
```

---

## 2. Dashboard

Files: [src/pages/Dashboard.jsx](src/pages/Dashboard.jsx), [src/components/dashboard/StatCard.jsx](src/components/dashboard/StatCard.jsx), [src/components/dashboard/RecentOrders.jsx](src/components/dashboard/RecentOrders.jsx), [src/components/dashboard/TopProducts.jsx](src/components/dashboard/TopProducts.jsx).

### Architecture overview

```mermaid
flowchart LR
    D["Dashboard"] --> SC["StatCard x N"]
    D --> RO["RecentOrders"]
    D --> TP["TopProducts"]
    D -->|ordersApi.getStats| S1["GET /api/orders/stats"]
    RO -->|ordersApi.getAll| S2["GET /api/orders"]
    TP -->|productsApi.getBestSellers| S3["GET /api/products/best-sellers"]
    TP -->|navigate| P["/products"]
```

### Action-loop workflow

```mermaid
flowchart TD
    A([Dashboard mounts]) --> B["getStats()"] --> C["setStats: totalRevenue, totalOrders, changes"]
    A --> D["RecentOrders fetch"] --> E["table of latest orders"]
    A --> F["TopProducts fetch"] --> G["best sellers list"]
    C & E & G --> H["render"] --> I([click product / View all]) --> J["navigate /products"]
```

### Sequence

```mermaid
sequenceDiagram
    participant D as Dashboard
    participant API as Server
    participant DB as SQL Server
    D->>API: GET /api/orders/stats
    API->>DB: revenue + counts (paid = payments succeeded)
    API-->>D: stats
    D->>API: GET /api/orders
    D->>API: GET /api/products/best-sellers
    API-->>D: lists
```

### Events / data flow

```mermaid
flowchart LR
    O[("orders")] & P[("payments")] --> ST["stats"] --> CARDS["revenue / orders cards"]
    O --> RO["Recent orders"]
    OI[("order_items")] --> BS["best-sellers"] --> TP["Top products"]
```

---

## 3. Catalog management

Files: [src/pages/Categories.jsx](src/pages/Categories.jsx), [src/pages/Subcategories.jsx](src/pages/Subcategories.jsx), [src/pages/Products.jsx](src/pages/Products.jsx); APIs `categoriesApi`, `subcategoriesApi`, `productsApi`, `colorsApi`, `sizesApi`.

### Architecture overview

```mermaid
flowchart LR
    CAT["Categories page"] -->|"FormData: name, description, image"| C["/api/categories"]
    SUB["Subcategories page"] -->|"FormData: category_id, name, image"| S["/api/subcategories"]
    PRD["Products page"] -->|"FormData: fields, images[], cover_img, size_chart, variants JSON"| P["/api/products"]
    PRD --> COL["/api/colors"] & SZ["/api/sizes"]
    C & S & P --> UP[/"server assets/uploads"/]
    C & S & P & COL & SZ --> DB[("catalog tables")]
```

### Action-loop workflow (product editor)

```mermaid
flowchart TD
    A([Products page]) --> B["load products, categories, subcategories, colors, sizes"] --> T["table"]
    T --> C([Add / Edit]) --> D["modal: details, category → subcategory"]
    D --> E["upload gallery images + cover + size chart"]
    E --> F["build variants: color x size, price, stock"]
    F --> G{"form valid?"}
    G -- no --> D
    G -- yes --> H["build FormData (keep existing images list)"] --> I["productsApi.create / update"]
    I --> J{"ok?"}
    J -- yes --> K["toast, reload list"] --> T
    J -- no --> L["error toast"] --> D
    T --> M([Delete]) --> N["Popconfirm"] --> O["productsApi.delete (soft delete)"] --> K
```

### Sequence

```mermaid
sequenceDiagram
    actor A as Admin
    participant P as Products page
    participant API as Server
    participant FS as Upload dir
    participant DB as SQL Server
    A->>P: fill product + variants + images
    P->>API: POST /api/products (multipart)
    API->>FS: save images / cover / size chart
    API->>DB: BEGIN, products, colors/sizes, variants, COMMIT
    API-->>P: created product
    P->>API: GET /api/products
    API-->>P: refreshed list
```

### Events / data flow

```mermaid
flowchart LR
    FILES["image files"] --> UP[/"uploads/products, size-charts, categories, subcategories"/]
    FORM["product form"] --> PR[("products")]
    FORM --> PV[("product_variants")]
    FORM --> CS[("product_colors / product_sizes")]
    CATF["category form"] --> CT[("categories")]
    SUBF["subcategory form"] --> SC[("subcategories")]
    PR & CT & SC & UP --> SHOP["Storefront nav, listings, product detail"]
    PR -->|delete| N(("product_deleted notification"))
```

---

## 4. Orders

Files: [src/pages/Orders.jsx](src/pages/Orders.jsx); `ordersApi.getAll`, `getById`, `updateStatus`.
Statuses: `pending`, `processing`, `shipped`, `delivered`, `cancelled`.

### Architecture overview

```mermaid
flowchart LR
    O["Orders page"] -->|GET /api/orders| API
    O -->|"GET /api/orders/:id"| API
    O -->|"PUT /api/orders/:id/status"| API
    O --> DT["detail drawer/modal: items, shipping, billing, payment"]
    O --> TAG["status Tag colors"]
    API["Server orderController"]
```

### Action-loop workflow

```mermaid
flowchart TD
    A([Orders page]) --> B["getAll"] --> C["table: id, email, total, status, payment_status, date"]
    C --> D([view]) --> E["getById"] --> F["detail view"]
    C --> G([change status select]) --> H["updateStatus(id, status)"] --> I{"ok?"}
    I -- yes --> J["toast, update row"] --> C
    I -- no --> K["error toast"] --> C
```

### Sequence

```mermaid
sequenceDiagram
    actor A as Admin
    participant O as Orders page
    participant API as Server
    participant IO as Socket.IO
    A->>O: set status shipped
    O->>API: PUT /api/orders/:id/status
    API-->>O: 200
    API->>IO: new-notification order_status_changed
    IO-->>O: bell updates
```

### Events / data flow

```mermaid
flowchart LR
    CK["storefront checkout"] -->|status pending| OR[("orders")]
    OR --> LIST["Orders table"]
    PAY[("payments")] -->|payment_status| LIST
    LIST -->|status change| OR
    OR -->|order_status_changed| N(("notification"))
```

---

## 5. Users & Customers

Files: [src/pages/Users.jsx](src/pages/Users.jsx), [src/pages/Customers.jsx](src/pages/Customers.jsx); `usersApi`.

### Architecture overview

```mermaid
flowchart LR
    U["Users page"] -->|"GET /api/users, PUT /:id, DELETE /:id"| API
    U -->|is_admin toggle/flag| API
    C["Customers page"] -->|GET /api/users/customers| API
    API["Server userController"] --> DB[("users + credentials")]
```

### Action-loop workflow

```mermaid
flowchart TD
    A([Users page]) --> B["getAll"] --> C["table with admin badge"]
    C --> D([edit]) --> E["modal: name, email, role is_admin"] --> F["update(id)"] --> B
    C --> G([delete]) --> H["Popconfirm"] --> I["delete(id)"] --> B
    J([Customers page]) --> K["getCustomers"] --> L["read-only table of buyers"]
```

### Sequence

```mermaid
sequenceDiagram
    actor A as Admin
    participant U as Users page
    participant API as Server
    participant DB as SQL Server
    A->>U: open Users
    U->>API: GET /api/users
    API->>DB: users JOIN credentials
    API-->>U: list
    A->>U: promote to admin
    U->>API: PUT /api/users/:id is_admin
    API->>DB: UPDATE users / credentials
    API-->>U: 200
```

### Events / data flow

```mermaid
flowchart LR
    REG["storefront signup"] --> US[("users / credentials")]
    REG -->|user_registered| N(("notification"))
    CO["checkout saveUser"] --> US
    US --> UL["Users table"]
    US --> CL["Customers table"]
    UL -->|edit / delete| US
```

---

## 6. Coupons

Files: [src/pages/Coupons.jsx](src/pages/Coupons.jsx), coupon actions inside `AdminHeader` notifications; `couponsApi`.

### Architecture overview

```mermaid
flowchart LR
    CP["Coupons page"] -->|CRUD| API["/api/coupons"]
    HD["AdminHeader bell: coupon_limit_reached"] -->|"Deactivate (PUT status) / Delete"| API
    API --> DB[("coupons")]
```

### Action-loop workflow

```mermaid
flowchart TD
    A([Coupons page]) --> B["getAll"] --> C["table: code, type, value, validity, usage used/limit, status"]
    C --> D([create / edit]) --> E["modal form"] --> F{"code unique?"}
    F -- no --> G["409 Code already exists"] --> E
    F -- yes --> H["save"] --> B
    N([bell: limit reached]) --> O{"admin choice"}
    O -- Deactivate --> P["update status inactive"] --> Q["mark notification read"]
    O -- Delete --> R["delete coupon"] --> Q
```

### Sequence

```mermaid
sequenceDiagram
    participant SF as Storefront checkout
    participant API as Server
    participant IO as Socket.IO
    participant HD as AdminHeader
    actor A as Admin
    SF->>API: order with couponCode
    API->>API: used_count reaches usage_limit
    API->>IO: new-notification coupon_limit_reached (couponId)
    IO-->>HD: show with Deactivate / Delete
    A->>HD: Deactivate
    HD->>API: PUT /api/coupons/:id status inactive
    HD->>API: POST /api/notifications/:id/read
```

### Events / data flow

```mermaid
flowchart LR
    F["coupon form"] --> C[("coupons")]
    C -->|validate| SF["storefront checkout"]
    SF -->|used_count + 1| C
    C -->|limit reached| N(("coupon_limit_reached")) --> B["bell actions"] --> C
```

---

## 7. Shipping rates

Files: [src/pages/Shipping.jsx](src/pages/Shipping.jsx); `shippingApi`.

### Architecture overview

```mermaid
flowchart LR
    S["Shipping page"] -->|"GET / POST / PUT :id / DELETE :id"| API["/api/shipping"] --> DB[("shipping_rates")]
    SC["SiteContent: default_intl_shipping_fee"] --> JSON[/"site_settings.json"/]
    DB & JSON --> SF["storefront Cart / Checkout fee"]
```

### Action-loop workflow

```mermaid
flowchart TD
    A([Shipping page]) --> B["getAll"] --> C["table: country, code, fee, currency, est. days, status"]
    C --> D([add / edit]) --> E["modal: pick country, fee, days, active"] --> F["create / update"] --> B
    C --> G([delete]) --> H["remove"] --> B
```

### Sequence

```mermaid
sequenceDiagram
    actor A as Admin
    participant S as Shipping page
    participant API as Server
    participant SF as Storefront
    A->>S: add Morocco 10 EUR
    S->>API: POST /api/shipping
    API-->>S: created
    SF->>API: GET /api/shipping/Morocco
    API-->>SF: fee 10
```

### Events / data flow

```mermaid
flowchart LR
    F["rate form"] --> R[("shipping_rates")]
    R --> CART["Cart delivery charge"]
    R --> CO["Checkout fee + server total"]
    DEF[/"default intl fee"/] -->|fallback| CO
```

---

## 8. CMS Pages & Site Content

Files: [src/pages/Pages.jsx](src/pages/Pages.jsx), [src/pages/PageEditor.jsx](src/pages/PageEditor.jsx) (React-Quill + TanStack Query), [src/pages/SiteContent.jsx](src/pages/SiteContent.jsx); `pagesApi`, `siteSettingsApi`.

### Architecture overview

```mermaid
flowchart LR
    PL["Pages list"] -->|"useQuery ['pages']"| P["/api/pages"]
    PE["PageEditor /pages/create, /pages/edit/:slug"] -->|"useQuery ['page', slug] + useMutation"| P
    SC["SiteContent"] -->|"GET / PUT"| S["/api/site-settings"]
    SC -->|"logo, hero, intro-image, payment-icon"| U["/api/site-settings/upload/*"]
    SC -->|section links| PE
    P --> DB[("pages")]
    S & U --> JSON[/"site_settings.json + uploads/site"/]
```

### Action-loop workflow

```mermaid
flowchart TD
    A([Pages list]) --> B["useQuery pages"] --> C["table"] --> D([edit / create]) --> E["PageEditor loads page by slug"]
    E --> F["edit title, slug, rich content"] --> G["mutation create / update"]
    G --> H["invalidateQueries pages"] --> B
    S([SiteContent]) --> T["GET settings"] --> U["form: hero, intro, footer, product info, payment methods, default shipping fee"]
    U --> V([upload image]) --> W["POST upload/*"] --> X["URL into form"] --> U
    U --> Y([save]) --> Z["PUT /api/site-settings"] --> T
```

### Sequence

```mermaid
sequenceDiagram
    actor A as Admin
    participant E as PageEditor
    participant Q as QueryClient
    participant API as Server
    A->>E: open /pages/edit/privacy-policy
    E->>Q: useQuery page, slug
    Q->>API: GET /api/pages/privacy-policy
    API-->>E: page
    A->>E: edit + save
    E->>API: PUT /api/pages/privacy-policy
    API-->>E: 200
    E->>Q: invalidateQueries pages
```

### Events / data flow

```mermaid
flowchart LR
    Q["Quill HTML"] --> PG[("pages")] --> SFP["storefront info pages (usePageContent)"]
    SF["SiteContent form"] --> JS[/"site_settings.json"/] --> SFS["storefront useSiteSettings: hero, intro, footer, icons"]
    IMG["uploaded images"] --> UP[/"uploads/site"/] --> JS
    JS -->|default_intl_shipping_fee| CK["server checkout"]
```

---

## 9. Real-time notifications

Files: [src/components/layout/AdminHeader.jsx](src/components/layout/AdminHeader.jsx); `notificationsApi` (`getUnread`, `markAsRead`, `markAllAsRead`).

### Architecture overview

```mermaid
flowchart LR
    HD["AdminHeader"] -->|"on mount + every 30s"| R["GET /api/notifications/unread"]
    HD --> IO["socket.io-client auth token"] <-->|"room admins: new-notification"| SRV["Socket.IO server"]
    HD -->|"click item"| MR["POST /:id/read"]
    HD -->|"Mark all as read"| MA["POST /mark-all-read"]
    HD -->|coupon_limit_reached actions| CP["couponsApi"]
```

### Action-loop workflow

```mermaid
flowchart TD
    A([header mounts]) --> B["load unread"] --> C["notifications state"]
    A --> D["socket connect"] --> E(("new-notification")) --> F["prepend to state"] --> C
    A --> P["setInterval 30s"] --> B
    C --> G["badge = count of is_read = 0"] --> H([open bell])
    H --> I([click item]) --> J["markAsRead"] --> K["set is_read = 1 locally"] --> C
    H --> L([Mark all]) --> M["markAllAsRead"] --> C
    X([unmount]) --> Y["clearInterval + socket.close"]
```

### Sequence

```mermaid
sequenceDiagram
    participant HD as AdminHeader
    participant API as Server REST
    participant IO as Socket.IO
    participant SF as Storefront
    HD->>API: GET /api/notifications/unread
    API-->>HD: list
    HD->>IO: connect auth token
    IO->>IO: verify is_admin, join admins
    SF->>API: POST /api/checkout
    API->>IO: emit new-notification order_created
    IO-->>HD: notification
    HD->>HD: prepend, badge +1
    HD->>API: POST /api/notifications/:id/read
```

### Events / data flow

```mermaid
flowchart LR
    T1["order_created"] & T2["order_status_changed"] & T3["stock_low"] & T4["product_deleted"] & T5["user_registered"] & T6["coupon_limit_reached"] --> DB[("notifications")]
    DB -->|socket new-notification| ST["header state"]
    DB -->|REST unread poll| ST
    ST --> BADGE["badge count"] & LIST["dropdown list"]
    LIST -->|read| DB
    LIST -->|coupon actions| CP[("coupons")]
```

---

## Notes from the code

I noticed these things while tracing the flows above. The diagrams show the code as it is.

- Route protection is client-side only, through `localStorage.user.is_admin`. The server does not check the token on admin endpoints.
- `Login.jsx` posts to `VITE_API_URL`, while everything else uses `VITE_BACKEND_SERVER_URL`. Both env vars must be set.
- The token is stored twice: `authToken` is used by `fetchApi` and the socket, and `token` is used by the axios instance. Logout removes `token` and `user`, but not `authToken`.
- When there is no token, the socket falls back to `{ role: 'admin' }`, which the server accepts.
- `Settings.jsx` exists, but its route is commented out.
