"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MovieCard from "@/components/MovieCard";
import { get } from "@/lib/api";
import { toItem, type Genre, type ListItem, type Media, type MediaType } from "@/lib/types";

function DiscoverInner() {
  const sp = useSearchParams();
  const router = useRouter();

  const type: MediaType = sp.get("type") === "tv" ? "tv" : "movie";
  const genres = (sp.get("genres") ?? "").split(",").filter(Boolean).map(Number);
  const from = sp.get("from") ?? "";
  const to = sp.get("to") ?? "";
  const sort = sp.get("sort") ?? "popularity.desc";
  const dateField = type === "movie" ? "primary_release_date" : "first_air_date";

  const [genreList, setGenreList] = useState<Genre[]>([]);
  const [items, setItems] = useState<ListItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // filters live in the URL so they can be shared
  const update = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    router.replace(`/discover?${p.toString()}`);
  };

  const toggleGenre = (id: number) => {
    const next = genres.includes(id) ? genres.filter((g) => g !== id) : [...genres, id];
    update({ genres: next.join(",") || undefined });
  };

  useEffect(() => {
    get<{ genres: Genre[] }>(`/genre/${type}/list`).then((d) => setGenreList(d.genres));
  }, [type]);

  const query = sp.toString();
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params: Record<string, unknown> = {
      sort_by: sort,
      page,
      "vote_count.gte": 50,
    };
    if (genres.length) params.with_genres = genres.join(",");
    if (from) params[`${dateField}.gte`] = `${from}-01-01`;
    if (to) params[`${dateField}.lte`] = `${to}-12-31`;

    get<{ results: Media[]; total_results: number; total_pages: number }>(`/discover/${type}`, params).then((d) => {
      if (cancelled) return;
      const mapped = d.results.map((m) => toItem(m, type));
      setItems((prev) => (page === 1 ? mapped : [...prev, ...mapped]));
      setTotal(d.total_results);
      setPages(d.total_pages);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page]);

  // reset to page 1 when the filters change
  useEffect(() => setPage(1), [query]);

  const sortOptions = [
    ["popularity.desc", "Popularity"],
    ["vote_average.desc", "Rating"],
    [`${dateField}.desc`, "Newest"],
  ];

  return (
    <main className="page">
      <h1>Discover</h1>
      <p className="muted">Browse the TMDB catalog with filters. Your filters are saved in the URL, so you can share them.</p>

      <div className="layout">
        <aside className="filters">
          <h3>Filters</h3>

          <div className="chips">
            {(["movie", "tv"] as const).map((t) => (
              <button key={t} className={`chip ${type === t ? "on" : ""}`} onClick={() => update({ type: t, genres: undefined, sort: undefined })}>
                {t === "movie" ? "Movies" : "TV Shows"}
              </button>
            ))}
          </div>

          <h4>Genres</h4>
          <div className="chips">
            {genreList.map((g) => (
              <button key={g.id} className={`chip ${genres.includes(g.id) ? "on" : ""}`} onClick={() => toggleGenre(g.id)}>
                {g.name}
              </button>
            ))}
          </div>
          {genres.length > 0 && <p className="muted small">Showing titles that match all selected genres.</p>}

          <h4>Release year</h4>
          <div className="years">
            <input className="input" type="number" placeholder="From" value={from} onChange={(e) => update({ from: e.target.value || undefined })} />
            <input className="input" type="number" placeholder="To" value={to} onChange={(e) => update({ to: e.target.value || undefined })} />
          </div>

          <h4>Sort by</h4>
          <select className="input" value={sort} onChange={(e) => update({ sort: e.target.value })}>
            {sortOptions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>

          <button className="btn" onClick={() => router.replace("/discover")}>Reset</button>
        </aside>

        <section>
          <p className="muted">{total.toLocaleString()} titles found</p>
          <div className="grid">{items.map((i) => <MovieCard key={i.id} item={i} />)}</div>
          {loading && <p className="muted">Loading...</p>}
          {!loading && page < pages && (
            <button className="btn center" onClick={() => setPage((p) => p + 1)}>Load more</button>
          )}
        </section>
      </div>
    </main>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<main className="page"><p className="muted">Loading...</p></main>}>
      <DiscoverInner />
    </Suspense>
  );
}
