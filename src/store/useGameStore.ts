import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type { OfflineSummary } from '@/types/save';
import type { GameStore } from './types';
import { SAVE_DATA_FIELDS } from './persistedFields';
import { GAME_SAVE_STORAGE_KEY } from '@/consts/storage';
import { createGameSlice } from './slices/gameSlice';
import { createDragonsSlice } from './slices/dragonsSlice';
import { createIslandSlice } from './slices/islandSlice';
import { createGardenSlice } from './slices/gardenSlice';
import { createBreedingSlice } from './slices/breedingSlice';

export const useGameStore = create<GameStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...createGameSlice(set, get),
        ...createDragonsSlice(set, get),
        ...createIslandSlice(set, get),
        ...createGardenSlice(set, get),
        ...createBreedingSlice(set, get),

        version: 1,
        last_save: Date.now(),

        tick: () => {
          // Производство, рост растений и инкубация считаются от timestamp'ов, поэтому
          // тик не мутирует состояние постоянно. Хук остаётся точкой входа для
          // будущих таймеров. См. [[useGameTick]].
        },

        applyOffline: (): OfflineSummary => {
          const now = Date.now();
          const state = get();
          const elapsed_ms = now - state.last_save;

          const breeding_completed =
            !!state.breeding.active && state.breeding.active.ready_at <= now;
          const eggs_hatched = state.incubator.filter((e) => e.ready_at <= now).length;

          return { elapsed_ms, breeding_completed, eggs_hatched };
        },

        reset: () => {
          set({
            player_level: 1,
            xp: 0,
            coins: 500,
            gems: 0,
            resources: {},
            unlocked_islands: ['ashen'],
            book_discovered: [],
            dragons: [],
            placements: {},
            cleared_cells: {},
            gardens: [],
            breeding: { active: null },
            incubator: [],
            last_save: Date.now(),
          });
          get().setCurrentIsland(get().currentIslandId);
        },
      }),
      {
        name: GAME_SAVE_STORAGE_KEY,
        version: 1,
        // Сохраняем один GDD-совместимый блоб; транзиентную сетку и экшены исключаем.
        partialize: (s) =>
          Object.fromEntries(
            SAVE_DATA_FIELDS.map((k) => [k, k === 'last_save' ? Date.now() : s[k]]),
          ) as Partial<GameStore>,
      },
    ),
  ),
);
