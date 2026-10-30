import axios from "axios";

// Requests go through our Next.js proxy (src/app/api/tmdb) so the token stays on the server.
export const tmdb = axios.create({ baseURL: "/api/tmdb" });

// Watchlist / favorites: saved per user through src/app/api/lists (Clerk metadata).
export const lists = axios.create({ baseURL: "/api/lists" });

export const get = async <T>(path: string, params?: Record<string, unknown>) =>
  (await tmdb.get<T>(path, { params })).data;

export const img = (path?: string | null, size = "w500") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : "/placeholder.svg";

export async function openTrailer(type: string, id: number) {
  const d = await get<{ results: { key: string; site: string; type: string }[] }>(
    `/${type}/${id}/videos`
  );
  const v =
    d.results.find((x) => x.site === "YouTube" && x.type === "Trailer") ??
    d.results.find((x) => x.site === "YouTube");
  if (v) window.open(`https://www.youtube.com/watch?v=${v.key}`, "_blank");
  else alert("Trailer topilmadi");
}
