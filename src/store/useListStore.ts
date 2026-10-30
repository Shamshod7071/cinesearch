import { create } from "zustand";
import { lists } from "@/lib/api";
import type { ListItem } from "@/lib/types";

export type ListName = "watchlist" | "favorites";

interface State {
  userId: string | null;
  watchlist: ListItem[];
  favorites: ListItem[];
  load: (userId: string) => Promise<void>;
  reset: () => void;
  has: (list: ListName, id: string) => boolean;
  toggle: (list: ListName, item: ListItem) => Promise<void>;
}

export const useListStore = create<State>((set, get) => ({
  userId: null,
  watchlist: [],
  favorites: [],

  load: async (userId) => {
    set({ userId });
    try {
      const { data } = await lists.get<{ watchlist: ListItem[]; favorites: ListItem[] }>("/");
      if (get().userId !== userId) return;
      set({ watchlist: data.watchlist, favorites: data.favorites });
    } catch {
      console.warn("Ro'yxatlarni yuklab bo'lmadi (/api/lists)");
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
      await lists.post("/", { list, action: exists ? "remove" : "add", item });
    } catch (e: any) {
      const msg = e?.response?.data?.status_message;
      if (msg) alert(msg);
      get().load(userId); // roll back to server state
    }
  },
}));
