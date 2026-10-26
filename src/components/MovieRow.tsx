import MovieCard from "./MovieCard";
import type { ListItem } from "@/lib/types";

export default function MovieRow({ title, items }: { title: string; items: ListItem[] }) {
  if (!items.length) return null;
  return (
    <section className="section">
      <h2>{title}</h2>
      <div className="row">
        {items.map((i) => <MovieCard key={i.id} item={i} />)}
      </div>
    </section>
  );
}
