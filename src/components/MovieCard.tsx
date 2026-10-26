"use client";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { img } from "@/lib/api";
import type { ListItem } from "@/lib/types";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useListStore } from "@/store/useListStore";

export default function MovieCard({ item }: { item: ListItem }) {
  const isFav = useListStore((s) => s.favorites.some((i) => i.id === item.id));
  const toggle = useListStore((s) => s.toggle);
  const person = item.type === "person";
  const guard = useAuthGuard();
  const { isSignedIn } = useAuth();

  const body = (
    <>
      <div className="poster">
        <img src={img(item.poster_path)} alt={item.title} loading="lazy" />
        <span className="tag">{item.type === "tv" ? "TV" : item.type === "movie" ? "MOVIE" : "PERSON"}</span>
        {!person && (
          <button
            className={`heart ${isFav ? "on" : ""}`}
            aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
            onClick={(e) => {
              e.preventDefault();
              guard(() => toggle("favorites", item))();
            }}
          >
            ♥
          </button>
        )}
      </div>
      <h4>{item.title}</h4>
      <p className="meta">
        {item.year}
        {item.vote_average > 0 && <span className="star">★ {item.vote_average.toFixed(1)}</span>}
      </p>
    </>
  );

  return person ? (
    <div className="card">{body}</div>
  ) : (
    <Link href={`/${item.type}/${item.tmdbId}`} className="card" prefetch={isSignedIn ? undefined : false}>{body}</Link>
  );
}
