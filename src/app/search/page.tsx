"use client";
import { useEffect, useRef, useState } from "react";
import MovieCard from "@/components/MovieCard";
import { get } from "@/lib/api";
import { toItem, type ListItem, type Media } from "@/lib/types";

const tabs = [
  { label: "All", key: "multi" },
  { label: "Movies", key: "movie" },
  { label: "TV Shows", key: "tv" },
  { label: "People", key: "person" },
];
const popularSearches = ["Inception", "Breaking Bad", "Interstellar", "Spider-Man"];

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [tab, setTab] = useState("multi");
  const [items, setItems] = useState<ListItem[]>([]);
  const [trending, setTrending] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => inputRef.current?.focus(), []);

  useEffect(() => {
    get<{ results: Media[] }>("/trending/all/week").then((d) =>
      setTrending(d.results.map((m) => toItem(m)))
    );
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 400);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (!debounced) {
      setItems([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    get<{ results: Media[] }>(`/search/${tab}`, { query: debounced }).then((d) => {
      if (cancelled) return;
      const list = d.results
        .filter((m) => tab !== "multi" || ["movie", "tv", "person"].includes(m.media_type ?? ""))
        .map((m) => toItem(m, tab === "multi" ? undefined : tab));
      setItems(list);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [debounced, tab]);

  return (
    <main className="page">
      <h1>Search</h1>
      <p className="muted">Find movies, TV shows and people from the TMDB catalog.</p>
      <input
        ref={inputRef}
        className="input"
        placeholder="Search movies, TV shows, people..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="chips">
        {tabs.map((t) => (
          <button key={t.key} className={`chip ${tab === t.key ? "on" : ""}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {!debounced ? (
        <>
          <p className="muted">
            Popular searches:{" "}
            {popularSearches.map((s) => (
              <button key={s} className="link" onClick={() => setQ(s)}>{s}</button>
            ))}
          </p>
          <h2>Trending this week</h2>
          <div className="grid">{trending.map((i) => <MovieCard key={i.id} item={i} />)}</div>
        </>
      ) : loading ? (
        <p className="muted">Searching...</p>
      ) : items.length === 0 ? (
        <p className="muted">Hech narsa topilmadi: “{debounced}”</p>
      ) : (
        <div className="grid">{items.map((i) => <MovieCard key={i.id} item={i} />)}</div>
      )}
    </main>
  );
}
