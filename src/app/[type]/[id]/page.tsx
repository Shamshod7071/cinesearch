"use client";
import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import MovieCard from "@/components/MovieCard";
import { get, img, openTrailer } from "@/lib/api";
import { toItem, type Genre, type Media } from "@/lib/types";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useListStore } from "@/store/useListStore";

interface Detail extends Media {
  tagline?: string;
  runtime?: number;
  episode_run_time?: number[];
  number_of_seasons?: number;
  genres: Genre[];
  budget?: number;
  revenue?: number;
  vote_count?: number;
  credits: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
    crew: { id: number; name: string; job: string }[];
  };
  similar: { results: Media[] };
  reviews: { results: { id: string; author: string; content: string }[] };
}

const TABS = ["Overview", "Cast & Crew", "Reviews", "Similar"] as const;
const money = (n?: number) => (n ? `$${n.toLocaleString()}` : "—");

export default function DetailPage() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [d, setD] = useState<Detail | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [error, setError] = useState(false);
  const guard = useAuthGuard();
  const toggle = useListStore((s) => s.toggle);
  const watchlist = useListStore((s) => s.watchlist);
  const favorites = useListStore((s) => s.favorites);

  if (type !== "movie" && type !== "tv") notFound();

  useEffect(() => {
    setD(null);
    setError(false);
    get<Detail>(`/${type}/${id}`, { append_to_response: "credits,similar,reviews" })
      .then(setD)
      .catch(() => setError(true));
    window.scrollTo(0, 0);
  }, [type, id]);

  if (error) return <main className="page state"><p className="muted">Topilmadi.</p></main>;
  if (!d) return <main className="page state"><p className="muted">Loading...</p></main>;

  const item = toItem(d, type);
  const runtime = d.runtime ?? d.episode_run_time?.[0];
  const director = d.credits.crew.find((c) => c.job === "Director");
  const inWatch = watchlist.some((w) => w.id === item.id);
  const inFav = favorites.some((w) => w.id === item.id);

  return (
    <main>
      <div className="detail-hero" style={{ backgroundImage: `url(${img(d.backdrop_path, "original")})` }}>
        <div className="hero-fade detail">
          <img className="detail-poster" src={img(d.poster_path, "w500")} alt={item.title} />
          <div>
            <h1>{item.title} <small>({item.year})</small></h1>
            {d.tagline && <p className="muted"><i>“{d.tagline}”</i></p>}
            <p className="meta">
              <span className="star">★ {item.vote_average.toFixed(1)}</span>
              {d.vote_count ? ` (${d.vote_count.toLocaleString()} votes)` : ""}
              {runtime ? ` · ${Math.floor(runtime / 60)}h ${runtime % 60}m` : ""}
              {d.number_of_seasons ? ` · ${d.number_of_seasons} seasons` : ""}
            </p>
            <div className="chips">{d.genres.map((g) => <span key={g.id} className="chip">{g.name}</span>)}</div>
            <p className="overview">{d.overview}</p>
            {director && <p className="muted">Director: <b>{director.name}</b></p>}
            <div className="actions">
              <button className="btn primary" onClick={guard(() => openTrailer(type, d.id))}>▶ Watch Trailer</button>
              <button className="btn" onClick={guard(() => toggle("watchlist", item))}>{inWatch ? "✓ In Watchlist" : "+ Add to Watchlist"}</button>
              <button className={`btn ${inFav ? "primary" : ""}`} onClick={guard(() => toggle("favorites", item))}>♥ {inFav ? "Favorited" : "Favorite"}</button>
              <button className="btn" onClick={() => navigator.clipboard.writeText(window.location.href)}>Share</button>
            </div>
          </div>
        </div>
      </div>

      <div className="page">
        <div className="tabs">
          {TABS.map((t) => (
            <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {tab === "Overview" && (
          <section>
            <h2>Synopsis</h2>
            <p>{d.overview || "No synopsis."}</p>
            {type === "movie" && (
              <p className="muted">Budget: {money(d.budget)} · Revenue: {money(d.revenue)}</p>
            )}
          </section>
        )}

        {tab === "Cast & Crew" && (
          <div className="grid">
            {d.credits.cast.slice(0, 18).map((c) => (
              <div key={c.id} className="card">
                <div className="poster"><img src={img(c.profile_path)} alt={c.name} loading="lazy" /></div>
                <h4>{c.name}</h4>
                <p className="meta">{c.character}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "Reviews" &&
          (d.reviews.results.length === 0 ? (
            <p className="muted">No reviews yet.</p>
          ) : (
            d.reviews.results.slice(0, 5).map((r) => (
              <article key={r.id} className="review">
                <b>{r.author}</b>
                <p>{r.content.length > 500 ? r.content.slice(0, 500) + "…" : r.content}</p>
              </article>
            ))
          ))}

        {tab === "Similar" && (
          <div className="grid">
            {d.similar.results.map((m) => <MovieCard key={m.id} item={toItem(m, type)} />)}
          </div>
        )}
      </div>
    </main>
  );
}
