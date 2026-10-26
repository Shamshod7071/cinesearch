import { NextRequest, NextResponse } from "next/server";

const clean = (v?: string) => v?.trim().replace(/^["']|["']$/g, "");

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const token = clean(process.env.TMDB_ACCESS_TOKEN);
  const apiKey = clean(process.env.TMDB_API_KEY);
  if (!token && !apiKey) {
    return NextResponse.json(
      { status_message: "TMDB_ACCESS_TOKEN yoki TMDB_API_KEY topilmadi. .env.local yarating va serverni qayta ishga tushiring." },
      { status: 500 }
    );
  }

  const base = process.env.TMDB_BASE_URL ?? "https://api.themoviedb.org/3";
  const url = new URL(`${base.replace(/\/$/, "")}/${params.path.join("/")}`);
  req.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));
  if (!url.searchParams.has("language")) url.searchParams.set("language", "en-US");

  const call = (withToken: boolean) => {
    const u = new URL(url);
    const headers: Record<string, string> = { accept: "application/json" };
    if (withToken) headers.Authorization = `Bearer ${token}`;
    else u.searchParams.set("api_key", apiKey!);
    return fetch(u, { headers, next: { revalidate: 300 } });
  };

  let r = token ? await call(true) : await call(false);
  // Bearer token rejected -> retry with the short API key if there is one
  if (r.status === 401 && token && apiKey) r = await call(false);

  return NextResponse.json(await r.json(), { status: r.status });
}
