"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth, UserButton } from "@clerk/nextjs";
import { useListStore } from "@/store/useListStore";

const publicLinks = [{ href: "/", label: "Home" }];
const privateLinks = [
  { href: "/search", label: "Search" },
  { href: "/discover", label: "Discover" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/favorites", label: "Favorites" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const load = useListStore((s) => s.load);
  const reset = useListStore((s) => s.reset);
  const watchCount = useListStore((s) => s.watchlist.length);

  useEffect(() => {
    if (!isLoaded) return;
    if (userId) load(userId);
    else reset();
  }, [isLoaded, userId, load, reset]);

  const links = isSignedIn ? [...publicLinks, ...privateLinks] : publicLinks;
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="nav">
      <Link href="/" className="logo">CINE<span>SEARCH</span></Link>
      <nav aria-label="Main">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={isActive(l.href) ? "active" : ""} prefetch={isSignedIn ? undefined : false}>
            {l.label}
            {l.href === "/watchlist" && watchCount > 0 && <em className="badge">{watchCount}</em>}
          </Link>
        ))}
      </nav>
      <div className="nav-auth">
        {!isLoaded ? null : isSignedIn ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <Link href="/login" className={`btn primary sm ${pathname.startsWith("/login") ? "active" : ""}`}>Login</Link>
        )}
      </div>
    </header>
  );
}
