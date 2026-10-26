"use client";
import { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import MovieRow from "@/components/MovieRow";
import { get } from "@/lib/api";
import { toItem, type Media } from "@/lib/types";

type Res = { results: Media[] };

export default function Home() {
  const [trending, setTrending] = useState<Media[]>([]);
  const [popular, setPopular] = useState<Media[]>([]);
  const [topRated, setTopRated] = useState<Media[]>([]);
  const [tv, setTv] = useState<Media[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fail = (e: any) =>
      setError(e?.response?.data?.status_message ?? e?.message ?? "Noma'lum xato");
    get<Res>("/trending/all/day").then((d) => setTrending(d.results.filter((m) => m.backdrop_path))).catch(fail);
    get<Res>("/movie/popular").then((d) => setPopular(d.results)).catch(fail);
    get<Res>("/movie/top_rated").then((d) => setTopRated(d.results)).catch(fail);
    get<Res>("/tv/popular").then((d) => setTv(d.results)).catch(fail);
  }, []);

  return (
    <main>
      <Hero items={trending.slice(0, 6)} />
      <div className="page">
        {error && <p className="muted">TMDB xatosi: {error}</p>}
        <MovieRow title="Trending Today" items={trending.map((m) => toItem(m))} />
        <MovieRow title="Popular Movies" items={popular.map((m) => toItem(m, "movie"))} />
        <MovieRow title="Top Rated" items={topRated.map((m) => toItem(m, "movie"))} />
        <MovieRow title="Popular TV Shows" items={tv.map((m) => toItem(m, "tv"))} />
      </div>
    </main>
  );
}
