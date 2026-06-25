import ContentLoader from '@game/systems/ContentLoader';
import type { DragonDef, DragonState } from '@/types/dragon';
import type { DragonsSlice, SliceCreator } from '../types';
import { MAX_RESOURCE_PER_TYPE } from '../types';
import { hasInfiniteStorage } from './gameSlice';

export const producedAmount = (dragon: DragonState, def: DragonDef, now: number): number => {
  if (dragon.stage !== 'adult' || dragon.last_collected === 0) return 0;

  const hours = (now - dragon.last_collected) / 3_600_000;
  let rate = def.production_per_hour;

  if (dragon.biome) {
    if (dragon.biome === def.favorite_biome) rate *= 1 + def.biome_buff;
    else if (dragon.biome === def.disliked_biome) rate *= 1 - def.biome_debuff;
  }

  return Math.min(def.storage_cap, Math.max(0, Math.floor(rate * hours)));
};

export const createDragonsSlice: SliceCreator<DragonsSlice> = (set, get) => ({
  dragons: [],

  addDragon: (state) => set((s) => ({ dragons: [...s.dragons, state] })),

  collectResource: (uid) => {
    const dragon = get().dragons.find((d) => d.uid === uid);
    if (!dragon) return;
    const def = ContentLoader.dragon(dragon.id);
    if (!def) return;

    const now = Date.now();
    const produced = producedAmount(dragon, def, now);
    if (produced === 0) return;

    const state = get();
    let toCollect = produced;
    let newLastCollected = now;

    if (!hasInfiniteStorage(state)) {
      const current = state.resources[def.resource] ?? 0;
      const space = MAX_RESOURCE_PER_TYPE - current;
      if (space <= 0) return;

      if (space < produced) {
        // Собираем только то, что влезает; сдвигаем last_collected назад,
        // чтобы дракон «помнил» оставшийся объём.
        toCollect = space;
        let rate = def.production_per_hour;
        if (dragon.biome) {
          if (dragon.biome === def.favorite_biome) rate *= 1 + def.biome_buff;
          else if (dragon.biome === def.disliked_biome) rate *= 1 - def.biome_debuff;
        }
        newLastCollected = now - Math.round(((produced - space) / rate) * 3_600_000);
      }
    }

    set((s) => ({
      dragons: s.dragons.map((d) =>
        d.uid === uid ? { ...d, last_collected: newLastCollected } : d,
      ),
    }));
    get().addResource(def.resource, toCollect);
  },
});
