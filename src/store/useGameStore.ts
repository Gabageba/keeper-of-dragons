import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import ContentLoader from '@/systems/ContentLoader';
import type { OfflineSummary } from '@/types';
import type { GameStore } from './types';
import { STORAGE_CAP } from './types';
import { createGameSlice, hasInfiniteStorage } from './slices/gameSlice';
import { createDragonsSlice, producedAmount } from './slices/dragonsSlice';
import { createIslandSlice } from './slices/islandSlice';
import { createGardenSlice } from './slices/gardenSlice';
import { createBreedingSlice } from './slices/breedingSlice';

export const STORE_KEY = 'dragons-game';

/** Поля, попадающие в сохранение (всё кроме экшенов и транзиентной сетки). */
const PERSISTED_KEYS = [
  'version',
  'last_save',
  'player_level',
  'xp',
  'coins',
  'gems',
  'resources',
  'unlocked_islands',
  'book_discovered',
  'dragons',
  'currentIslandId',
  'placements',
  'cleared_cells',
  'gardens',
  'breeding',
  'incubator',
] as const;

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
          // будущих таймеров (правило 3 архитектуры). См. [[useGameTick]].
        },

        applyOffline: (): OfflineSummary => {
          const now = Date.now();
          const state = get();
          const elapsed_ms = now - state.last_save;
          const infinite = hasInfiniteStorage(state);

          const resources = { ...state.resources };
          const resources_gained: Record<string, number> = {};

          const dragons = state.dragons.map((dragon) => {
            if (dragon.stage !== 'adult') return dragon;
            const def = ContentLoader.dragon(dragon.id);
            if (!def) return dragon;
            if (dragon.last_collected === 0) return { ...dragon, last_collected: now };

            let produced = producedAmount(dragon, def, now);
            if (produced <= 0) return dragon;

            if (!infinite) {
              produced = Math.min(produced, STORAGE_CAP - (resources[def.resource] ?? 0));
              if (produced <= 0) return dragon;
            }

            resources[def.resource] = (resources[def.resource] ?? 0) + produced;
            resources_gained[def.resource] = (resources_gained[def.resource] ?? 0) + produced;
            return { ...dragon, last_collected: now };
          });

          const breeding_completed =
            !!state.breeding.active && state.breeding.active.ready_at <= now;
          const eggs_hatched = state.incubator.filter((e) => e.ready_at <= now).length;

          set({ resources, dragons });
          return { elapsed_ms, resources_gained, breeding_completed, eggs_hatched };
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
        name: STORE_KEY,
        version: 1,
        // Сохраняем один GDD-совместимый блоб; транзиентную сетку и экшены исключаем.
        partialize: (s) =>
          Object.fromEntries(
            PERSISTED_KEYS.map((k) => [k, k === 'last_save' ? Date.now() : s[k]]),
          ) as Partial<GameStore>,
      },
    ),
  ),
);
