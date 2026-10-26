export type MediaType = "movie" | "tv";
export type ItemType = MediaType | "person";

export interface Media {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  profile_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface ListItem {
  id: string; // "movie-123" (json-server id)
  tmdbId: number;
  type: ItemType;
  title: string;
  poster_path: string | null;
  vote_average: number;
  year: string;
}

export const toItem = (m: Media, forced?: string): ListItem => {
  const type = (forced ?? m.media_type ?? "movie") as ItemType;
  return {
    id: `${type}-${m.id}`,
    tmdbId: m.id,
    type,
    title: m.title ?? m.name ?? "Untitled",
    poster_path: m.poster_path ?? m.profile_path ?? null,
    vote_average: m.vote_average ?? 0,
    year: (m.release_date ?? m.first_air_date ?? "").slice(0, 4),
  };
};
