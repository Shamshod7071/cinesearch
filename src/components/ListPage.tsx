"use client";
import MovieCard from "./MovieCard";
import { useListStore, type ListName } from "@/store/useListStore";

export default function ListPage({ list, title, empty }: { list: ListName; title: string; empty: string }) {
  const items = useListStore((s) => s[list]);
  return (
    <main className="page">
      <h1>{title} <small>{items.length}</small></h1>
      {items.length === 0 ? (
        <p className="muted">{empty}</p>
      ) : (
        <div className="grid">{items.map((i) => <MovieCard key={i.id} item={i} />)}</div>
      )}
    </main>
  );
}
