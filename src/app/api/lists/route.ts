import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import type { ItemType, ListItem } from "@/lib/types";

// Netlify'da json-server yo'q, shuning uchun watchlist/favorites Clerk foydalanuvchisining
// metadata'sida saqlanadi (har bir foydalanuvchi uchun alohida, qo'shimcha DB kerak emas).
//   watchlist -> privateMetadata, favorites -> publicMetadata (har biri ~8KB limit)
const LIMIT_BYTES = 7500;

// Joyni tejash uchun ixcham ko'rinish: [type, tmdbId, title, poster_path, vote_average, year]
type Packed = [ItemType, number, string, string | null, number, string];

const pack = (i: ListItem): Packed => [i.type, i.tmdbId, i.title, i.poster_path, i.vote_average, i.year];
const unpack = ([type, tmdbId, title, poster_path, vote_average, year]: Packed): ListItem => ({
  id: `${type}-${tmdbId}`,
  tmdbId,
  type,
  title,
  poster_path,
  vote_average,
  year,
});

const read = (v: unknown): Packed[] => (Array.isArray(v) ? (v as Packed[]) : []);

export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ status_message: "Avval login qiling." }, { status: 401 });

  const user = await clerkClient.users.getUser(userId);
  return NextResponse.json({
    watchlist: read(user.privateMetadata?.watchlist).map(unpack),
    favorites: read(user.publicMetadata?.favorites).map(unpack),
  });
}

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ status_message: "Avval login qiling." }, { status: 401 });

  const { list, action, item } = (await req.json()) as {
    list: "watchlist" | "favorites";
    action: "add" | "remove";
    item: ListItem;
  };
  if ((list !== "watchlist" && list !== "favorites") || !item?.id) {
    return NextResponse.json({ status_message: "Noto'g'ri so'rov." }, { status: 400 });
  }

  const user = await clerkClient.users.getUser(userId);
  const current = read(list === "watchlist" ? user.privateMetadata?.watchlist : user.publicMetadata?.favorites);
  const key = `${item.type}-${item.tmdbId}`;
  const without = current.filter((p) => `${p[0]}-${p[1]}` !== key);
  const next = action === "add" ? [...without, pack(item)] : without;

  if (JSON.stringify(next).length > LIMIT_BYTES) {
    return NextResponse.json(
      { status_message: "Ro'yxat to'lib qoldi. Avval bir nechta elementni o'chiring." },
      { status: 413 }
    );
  }

  await clerkClient.users.updateUserMetadata(
    userId,
    list === "watchlist" ? { privateMetadata: { watchlist: next } } : { publicMetadata: { favorites: next } }
  );
  return NextResponse.json({ ok: true });
}
