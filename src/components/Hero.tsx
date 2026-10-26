"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { img, openTrailer } from "@/lib/api";
import { toItem, type Media } from "@/lib/types";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useListStore } from "@/store/useListStore";

export default function Hero({ items }: { items: Media[] }) {
  const [i, setI] = useState(0);
  const guard = useAuthGuard();
  const toggle = useListStore((s) => s.toggle);
  const watchlist = useListStore((s) => s.watchlist);

  useEffect(() => {
    if (!items.length) return;
    const t = setInterval(() => setI((x) => (x + 1) % items.length), 7000);
    return () => clearInterval(t);
  }, [items.length]);

  if (!items.length) return null;
  const m = items[i];
  const item = toItem(m);
  const inList = watchlist.some((w) => w.id === item.id);

  return (
    <div className="hero" style={{ backgroundImage: `url(${img(m.backdrop_path, "original")})` }}>
      <div className="hero-fade">
        <span className="pill">{item.type === "tv" ? "TV" : "MOVIE"} · TRENDING TODAY</span>
        <h1>{item.title}</h1>
        <p className="meta">
          <span className="star">★ {item.vote_average.toFixed(1)}</span> {item.year}
        </p>
        <p className="overview clamp">{m.overview}</p>
        <div className="actions">
          <button className="btn primary" onClick={guard(() => openTrailer(item.type, item.tmdbId))}>▶ Play Trailer</button>
          <button className="btn" onClick={guard(() => toggle("watchlist", item))}>
            {inList ? "✓ In Watchlist" : "+ Add to Watchlist"}
          </button>
          <Link className="btn" href={`/${item.type}/${item.tmdbId}`}>More Info</Link>
        </div>
        <div className="dots" role="tablist">
          {items.map((_, k) => (
            <button key={k} className={k === i ? "on" : ""} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
