# blinkit-clone-frontend-user

## Role
Customer-facing PWA. Entry point for shoppers browsing Food, Bazaar, and Electronics verticals.

## Active Branch
`main2` — all development here; merge to `main` only after team review.

## Stack
- Vite 5 + React 18 + TypeScript 5
- TanStack Query v5 (`@tanstack/react-query`)
- React Router v6
- Tailwind CSS + shadcn/ui (Radix UI primitives)
- Firebase (auth / push notifications)
- Leaflet / react-leaflet (map / delivery zones)
- Zod (schema validation)
- Vitest + Playwright (test)

## Environment
Create `.env.local` before running:
```
VITE_API_BASE_URL=https://nainistore.com
```

## Dev
```bash
bun install
bun run dev        # http://localhost:5173
bun run build
bun run lint
bun run test
```

## Architecture

### API Layer (`src/lib/api.ts`)
Thin fetch wrappers: `apiGet`, `apiPost`, `apiPut`, `apiDelete`, `publicPost`.
- Base URL from `VITE_API_BASE_URL`
- Response envelope: `{ success, data, message }`
- Auth token stored in `localStorage` as `accessToken`
- Refresh token stored as `refreshToken`
- `authHeaders()` attaches `Authorization: Bearer <token>`

### Contexts
| Context | File | Purpose |
|---------|------|---------|
| `CartContext` | `src/context/CartContext.tsx` | Global cart state |
| `WishlistContext` | `src/context/WishlistContext.tsx` | Wishlist items |

### Routing (`src/App.tsx`)
- `/` → `Index` (home, food vertical) — RequireAuth
- `/auth` → `Auth`
- `/search/:storeId` → `SearchPage`
- `/store/:storeId` → `StorePage` (bazaar / electronics)
- `/restaurants` → `RestaurantList`
- `/restaurant/:restaurantId` → `RestaurantPage`
- `/cart`, `/checkout`, `/payment`, `/orders`, `/order-tracking/:orderId` — unified routes (RequireAuth)
- Legacy `/store/:storeId/cart|checkout|payment|orders` → redirect to unified
- `/profile`, `/addresses`, `/notifications`, `/wishlist`, `/onboarding` — RequireAuth

### Key Components (`src/components/customer/`)
| Component | Purpose |
|-----------|---------|
| `CustomerHeader` | Top nav with search, cart badge |
| `BottomNav` | Mobile bottom tab bar |
| `HeroBanner` | Carousel banners from CMS |
| `CategoryPills` | Horizontal scrollable category filter |
| `ProductCard` | Product tile with add-to-cart |
| `FloatingCartBar` | Sticky cart summary bar |
| `LocationPicker` | Address / zone selection |
| `StoreTabs` | Food / Bazaar / Electronics tab switcher |
| `SplashScreen` | App splash on cold start |

### Native Bridge (`src/lib/`)
| File | Purpose |
|------|---------|
| `nativeApp.ts` | Deep link handling for WebView wrapper |
| `pushNotifications.ts` | FCM push token registration |
| `haptics.ts` | Vibration on tap (mobile only) |
| `cartApi.ts` | Cart CRUD against backend |

## Business Verticals
- **Food** (`/` and `/restaurants`): restaurant listing, menu, food ordering
- **Bazaar** (`/store/bazaar`): grocery / general stores
- **Electronics** (`/store/electronic`): electronics stores

## Security Notes
- JWT stored in `localStorage` — acceptable for PWA; never add `dangerouslySetInnerHTML`
- `VITE_*` env vars are bundled into the client — never put secrets in `.env.local` beyond the API base URL

## Code Review Reminders
- React Hooks must never be inside conditionals — enforced by ESLint
- All new pages need a `RequireAuth` wrapper if they show user-specific data
- Use `useQuery` / `useMutation` for all API calls — no raw `fetch` in components
- Prefer `apiGet<T>` / `apiPost<T>` helpers over raw fetch
- Keep components under 300 lines; extract sub-components when needed

## Test Plan (before merge)
- [ ] `bun run build` zero errors
- [ ] `bun run lint` zero warnings
- [ ] `bun run test` all green
- [ ] Manually verify on nainistore.com API: home, bazaar store, product add-to-cart, checkout flow
- [ ] Mobile viewport (390×844) visual check

## Learnings Log
_Update this section after each sprint or significant fix._

| Date | Learning |
|------|---------|
| 2026-06-04 | Initial exploration. Unified cart/checkout routes. Legacy `/store/:id/*` routes redirect. Native deep-link bridge uses `naini-notification-navigate` custom event. Haptic feedback on every tappable element on mobile. |
