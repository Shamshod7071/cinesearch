import { create } from "zustand";
import { local } from "@/lib/api";
import type { ListItem } from "@/lib/types";

export type ListName = "watchlist" | "favorites";

// json-server'dagi yozuv: har bir foydalanuvchining ro'yxati alohida (userId + unikal id)
type Row = ListItem & { userId: string; itemId: string };

interface State {
  userId: string | null;
  watchlist: ListItem[];
  favorites: ListItem[];
  load: (userId: string) => Promise<void>;
  reset: () => void;
  has: (list: ListName, id: string) => boolean;
  toggle: (list: ListName, item: ListItem) => Promise<void>;
}

const rowId = (userId: string, id: string) => `${userId}_${id}`;
const fromRow = ({ userId: _u, itemId, ...rest }: Row): ListItem => ({ ...rest, id: itemId });

export const useListStore = create<State>((set, get) => ({
  userId: null,
  watchlist: [],
  favorites: [],

  load: async (userId) => {
    set({ userId });
    try {
      const [w, f] = await Promise.all([
        local.get<Row[]>("/watchlist", { params: { userId } }),
        local.get<Row[]>("/favorites", { params: { userId } }),
      ]);
      if (get().userId !== userId) return;
      set({ watchlist: w.data.map(fromRow), favorites: f.data.map(fromRow) });
    } catch {
      console.warn("json-server ishlamayapti (npm run dev:db)");
    }
  },

  reset: () => set({ userId: null, watchlist: [], favorites: [] }),

  has: (list, id) => get()[list].some((i) => i.id === id),

  toggle: async (list, item) => {
    const userId = get().userId;
    if (!userId) return;
    const exists = get().has(list, item.id);
    // optimistic update
    set((s) => ({
      [list]: exists ? s[list].filter((i) => i.id !== item.id) : [...s[list], item],
    }) as Partial<State>);
    try {
      if (exists) await local.delete(`/${list}/${encodeURIComponent(rowId(userId, item.id))}`);
      else await local.post(`/${list}`, { ...item, id: rowId(userId, item.id), itemId: item.id, userId });
    } catch {
      get().load(userId); // roll back to server state
    }
  },
}));
