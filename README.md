# CineSearch

TMDB asosidagi kino/serial ilovasi. Stack: Next.js 14 (App Router) + TypeScript + axios + zustand + json-server.

## Ishga tushirish
```bash
npm install
cp .env.local.example .env.local   # TMDB_ACCESS_TOKEN va Clerk kalitlarini yozing
npm run dev                         # Next (3000) + json-server (4000)
```

- `/` Home: hero slider + Trending / Popular / Top Rated / TV
- `/search` qidiruv (debounce, All/Movies/TV/People, Ctrl+K)
- `/discover` filtrlar (janr, yil, saralash) — URL'da saqlanadi
- `/movie/:id`, `/tv/:id` detail: trailer, cast, reviews, similar
- `/watchlist`, `/favorites` — `db.json` orqali json-server'da saqlanadi

TMDB token serverda qoladi: brauzer `/api/tmdb/*` proxy'ga murojaat qiladi.

## Auth (Clerk)
- dashboard.clerk.com da app yarating, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` va `CLERK_SECRET_KEY` ni `.env.local` ga qo'ying.
- Login qilinmagan foydalanuvchi faqat `/`, `/login` (va `/sign-up`) ga kira oladi; qolgan hamma sahifa (`/movie/:id`, `/tv/:id`, search, discover, watchlist, favorites) `/login` ga yo'naltiradi (`src/middleware.ts`).
- Watchlist/Favorites har bir foydalanuvchi uchun alohida saqlanadi.
