<div align="center">

<h1>🛒 ECAVO — Frontend</h1>
<p><strong>Premium Arabic-first E-Commerce Storefront</strong></p>

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![i18n](https://img.shields.io/badge/i18n-AR%20%7C%20EN-green)](https://www.i18next.com)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

</div>

---

## 📖 Overview

**ECAVO** is a full-featured, bilingual (Arabic/English) e-commerce frontend built with React 19, Vite, and TailwindCSS. It connects to a Laravel 11 REST API and offers a complete shopping experience — from product browsing and cart management to checkout, order tracking, and a full admin dashboard.

> RTL-first design. All layouts, typography, and animations are optimised for Arabic. English is fully supported with automatic LTR switching.

---

## ✨ Features

### 🛍️ Storefront
- **Home** — Hero slider, featured deals with countdown timers, sale carousel, electronics section
- **Product Listing** — Filters (category, price range), sort, grid/list toggle, pagination, skeleton loading
- **Product Detail** — Image gallery with thumbnails, variant selection, quantity picker, wishlist, tabs (description / specs / reviews)
- **Categories** — Color-coded grid, sub-category pills, bilingual names
- **Cart Drawer** — Live slide-in panel, quantity controls, subtotal/total with delivery fee, coupon support
- **Checkout** — Address form, coupon code, order summary
- **Order Confirmation** — Live order status, estimated delivery
- **Order Tracking** — 11-status timeline (horizontal/vertical), delivery details
- **Wishlist** — Grid view, move-to-cart, persistent state
- **My Account** — Orders history with status badges, editable profile

### 🔐 Authentication
- Login / Register (Sanctum Bearer Token)
- Protected routes with `ProtectedRoute` wrapper (redirects with return path)
- Admin-only route guard (`adminOnly` flag)

### 🛠️ Admin Dashboard
| Section | Features |
|---|---|
| **Dashboard** | Live KPI cards, 11-status order distribution, recent orders table |
| **Orders** | Searchable table, status update modal (11 statuses), colored badges |
| **Products** | Full CRUD, drag-and-drop image upload (up to 8 images), set primary image |
| **Categories** | Hierarchical tree, bilingual create/edit modal, delete protection |

### 🌐 Internationalisation & Currency
- **Languages**: Arabic (RTL) + English (LTR) — switched from the top bar
- **Currencies**: USD, MAD, EGP, SAR, AED, EUR, GBP — live rates from `open.er-api.com` (60-min cache)
- Auto `dir` / `lang` attribute sync on `<html>`

### ⚡ Performance & UX
- Shimmer skeleton loaders (product cards, rows, detail page)
- Image lazy loading
- Swiper carousels with custom styled navigation arrows
- Smooth drawer slide animations (RTL-aware)
- `react-helmet-async` SEO (title, description, Open Graph, Twitter cards)
- Live exchange rates fetched once per session

---

## 🗂️ Project Structure

```
ecavo-frontend/
├── public/                     # Static assets
└── src/
    ├── assets/img/             # Banner, slider, product images
    ├── components/
    │   ├── admin/              # ImageUploader
    │   ├── common/             # HeroSlider, BannerGrid, FeatureBar, SEO, SectionTitle
    │   ├── layout/             # Header (TopBar, SearchBar, NavMenu, CartIcon, SidebarDrawer), Footer
    │   ├── product/            # ProductCard
    │   └── ui/                 # Spinner, Skeleton, StarRating, CountdownTimer
    ├── features/
    │   ├── admin/              # DashboardPage, OrdersPage, ProductsPage, CategoriesPage
    │   ├── auth/               # LoginForm, RegisterForm
    │   ├── cart/               # CartDrawer
    │   ├── checkout/           # CheckoutForm
    │   ├── orders/             # OrderDetail
    │   ├── products/           # ProductFilters
    │   └── wishlist/           # WishlistGrid
    ├── hooks/                  # Custom React hooks
    ├── i18n/                   # ar.json, en.json translations
    ├── layouts/                # MainLayout, AdminLayout
    ├── pages/                  # Route-level page components
    ├── router/                 # React Router config (with guards)
    ├── services/               # Axios API service layer
    ├── store/                  # Zustand stores (auth, cart, wishlist, locale)
    └── utils/                  # imageUrl resolver, helpers
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| ECAVO API | Running on `http://localhost:8001` |

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/ecavo-frontend.git
cd ecavo-frontend

# Install dependencies
npm install
```

### Environment

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:8001/api
```

> If the API runs on a different port, update this value accordingly.

### Development

```bash
npm run dev
```

App runs at **http://localhost:5173**

### Production Build

```bash
npm run build       # Outputs to /dist
npm run preview     # Preview the production build locally
```

---

## 🔗 API Connection

The frontend connects to the **ECAVO Laravel API** (`ecavo-api`).
All requests go through `src/services/api.js` using Axios with:

- Base URL: `VITE_API_URL`
- Bearer token injected from Zustand `useAuthStore`
- `Accept: application/json` header on every request
- `withCredentials: false` (stateless Bearer token auth)

---

## 🔑 Default Admin Access

| Field | Value |
|---|---|
| URL | `http://localhost:5173/admin` |
| Email | `admin@ecavo.com` |
| Password | `Admin@1234` |

---

## 🧰 Tech Stack

| Library | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool & dev server |
| TailwindCSS | 3 | Utility-first styling |
| React Router DOM | 6 | Client-side routing |
| Zustand | 5 | State management (auth, cart, wishlist, locale) |
| Axios | 1 | HTTP client |
| i18next + react-i18next | 26/17 | Internationalisation (AR/EN) |
| Swiper | 12 | Touch/carousel sliders |
| Lucide React | 1 | Icon library |
| react-helmet-async | 3 | SEO meta tags |

---

## 🗺️ Routes

| Path | Component | Protected |
|---|---|---|
| `/` | Home | — |
| `/products` | Products | — |
| `/products/:slug` | ProductDetail | — |
| `/categories` | Categories | — |
| `/categories/:slug` | Category products | — |
| `/cart` | Cart | — |
| `/login` | Login | — |
| `/register` | Register | — |
| `/checkout` | Checkout | ✅ Auth |
| `/wishlist` | Wishlist | ✅ Auth |
| `/account` | My Account | ✅ Auth |
| `/orders/:id/track` | Order Tracking | ✅ Auth |
| `/admin` | Admin Dashboard | ✅ Admin |
| `/admin/orders` | Orders Management | ✅ Admin |
| `/admin/products` | Products Management | ✅ Admin |
| `/admin/categories` | Categories Management | ✅ Admin |

---

## 🖼️ Image Handling

Product images are uploaded via the admin dashboard and served from:

```
http://localhost:8001/storage/products/{uuid}.{ext}
```

The `resolveImageUrl()` utility automatically converts any relative `/storage/...` path to the full API URL, so images always load correctly across all pages.

**Supported upload formats:** JPEG, PNG, WebP, GIF — Max **4 MB** per image — Max **8 images** per product.

---

## 📦 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## 📄 License

MIT © 2024 ECAVO. Built with ❤️ for the MENA e-commerce market.
