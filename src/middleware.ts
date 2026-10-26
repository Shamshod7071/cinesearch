import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { clerkReady } from "@/lib/clerkReady";

// Login qilinmagan foydalanuvchi faqat shu sahifalarga kira oladi.
const isPublicPage = createRouteMatcher(["/", "/login(.*)", "/sign-up(.*)"]);

// Home sahifa ishlatadigan TMDB so'rovlari (qolgan hammasi login talab qiladi).
const PUBLIC_TMDB = new Set([
  "/trending/all/day",
  "/movie/popular",
  "/movie/top_rated",
  "/tv/popular",
]);

const protectedMiddleware = clerkMiddleware((auth, req) => {
  if (auth().userId) return;
  if (isPublicPage(req)) return;

  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/")) {
    if (pathname.startsWith("/api/tmdb/") && PUBLIC_TMDB.has(pathname.slice("/api/tmdb".length))) return;
    return NextResponse.json({ status_message: "Avval login qiling." }, { status: 401 });
  }

  // Boshqa hamma sahifa (detail, search, discover, watchlist, favorites) -> /login
  return auth().redirectToSignIn({ returnBackUrl: req.url });
});

// Kalit yo'q bo'lsa: sahifalarda sozlash ko'rsatmasi chiqadi, API yopiq turadi.
const unconfigured = (req: NextRequest) =>
  req.nextUrl.pathname.startsWith("/api/")
    ? NextResponse.json({ status_message: "Clerk kalitlari sozlanmagan." }, { status: 503 })
    : NextResponse.next();

export default clerkReady ? protectedMiddleware : unconfigured;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
