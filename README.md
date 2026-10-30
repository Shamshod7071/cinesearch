# CineSearch

TMDB asosidagi kino/serial ilovasi. Stack: Next.js 14 (App Router) + TypeScript + axios + zustand + Clerk.

## Ishga tushirish
```bash
npm install
cp .env.local.example .env.local   # TMDB_ACCESS_TOKEN va Clerk kalitlarini yozing
npm run dev                         # http://localhost:3000
```

- `/` Home: hero slider + Trending / Popular / Top Rated / TV
- `/search` qidiruv (debounce, All/Movies/TV/People, Ctrl+K)
- `/discover` filtrlar (janr, yil, saralash) — URL'da saqlanadi
- `/movie/:id`, `/tv/:id` detail: trailer, cast, reviews, similar
- `/watchlist`, `/favorites` — Clerk foydalanuvchi metadata'sida saqlanadi (`/api/lists`), alohida DB kerak emas

TMDB token serverda qoladi: brauzer `/api/tmdb/*` proxy'ga murojaat qiladi.

## Auth (Clerk)
- dashboard.clerk.com da app yarating, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` va `CLERK_SECRET_KEY` ni `.env.local` ga qo'ying.
- Login qilinmagan foydalanuvchi faqat `/`, `/login` (va `/sign-up`) ga kira oladi; qolgan hamma sahifa (`/movie/:id`, `/tv/:id`, search, discover, watchlist, favorites) `/login` ga yo'naltiradi (`src/middleware.ts`).
- Watchlist/Favorites har bir foydalanuvchi uchun alohida saqlanadi.

## Netlify'ga deploy
1. Repozitoriyni GitHub'ga push qiling (`.env.local` push bo'lmasligi kerak).
2. Netlify -> Add new site -> Import an existing project -> repozitoriyni tanlang (`netlify.toml` tayyor).
3. Site configuration -> Environment variables ga `.env.local.example` dagi o'zgaruvchilarni qiymatlari bilan kiriting
   (`TMDB_ACCESS_TOKEN` yoki `TMDB_API_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, ...).
4. Deploy qiling.
