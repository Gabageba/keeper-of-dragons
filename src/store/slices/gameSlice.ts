import ContentLoader from '@game/systems/ContentLoader';
import type { GameStore, GameSlice, SliceCreator } from '../types';
import { MAX_RESOURCE_PER_TYPE } from '../types';

export function xpForLevel(level: number): number {
  return level <= 1 ? 0 : (level - 1) * 100 * level;
}

export const hasInfiniteStorage = (store: GameStore): boolean => {
  return store.dragons.some(
    (d) => d.stage === 'adult' && ContentLoader.dragon(d.id)?.global_bonus === 'infinite_storage',
  );
};

export const createGameSlice: SliceCreator<GameSlice> = (set, get) => ({
  player_level: 1,
  xp: 0,
  coins: 500,
  gems: 0,
  resources: {},
  unlocked_islands: ['ashen'],
  book_discovered: [],

  addCoins: (n) => set((s) => ({ coins: s.coins + n })),

  spendCoins: (n) => {
    if (get().coins < n) return false;
    set((s) => ({ coins: s.coins - n }));
    return true;
  },

  addGems: (n) => set((s) => ({ gems: s.gems + n })),

  spendGems: (n) => {
    if (get().gems < n) return false;
    set((s) => ({ gems: s.gems - n }));
    return true;
  },

  addResource: (id, n) => {
    const cap = hasInfiniteStorage(get()) ? Infinity : MAX_RESOURCE_PER_TYPE;
    set((s) => ({
      resources: { ...s.resources, [id]: Math.min((s.resources[id] ?? 0) + n, cap) },
    }));
  },

  spendResource: (id, n) => {
    const current = get().resources[id] ?? 0;
    if (current < n) return false;
    set((s) => ({ resources: { ...s.resources, [id]: current - n } }));
    return true;
  },

  addXp: (n) => {
    set((s) => {
      const xp = s.xp + n;
      let level = s.player_level;
      while (xp >= xpForLevel(level + 1)) level += 1;
      return { xp, player_level: level };
    });
  },

  discoverInBook: (id) => {
    if (get().book_discovered.includes(id)) return;
    set((s) => ({ book_discovered: [...s.book_discovered, id] }));
  },

  unlockIsland: (id) => {
    if (get().unlocked_islands.includes(id)) return;
    set((s) => ({ unlocked_islands: [...s.unlocked_islands, id] }));
  },
});
