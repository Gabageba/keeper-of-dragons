import ContentLoader from '@game/systems/ContentLoader';
import { DRAGON_STAGE, PRODUCTION_STATE } from '@/types/dragon';
import type { DragonDef, DragonState, DragonProduction } from '@/types/dragon';
import type { DragonsSlice, SliceCreator } from '../types';
import { MAX_RESOURCE_PER_TYPE } from '../types';
import { hasInfiniteStorage } from './gameSlice';
import {
  YIELD_UPGRADE_BONUS_PER_LEVEL,
  YIELD_UPGRADE_MAX_LEVEL,
  yieldUpgradeCost,
} from '@/consts/balance';

/** Множитель выхода от уровня улучшения дракона. */
export const yieldMultiplier = (yieldLevel: number): number =>
  1 + (yieldLevel ?? 0) * YIELD_UPGRADE_BONUS_PER_LEVEL;

/**
 * Размер партии, которую произведёт дракон, если покормить его растением `plantId`.
 * Учитывает улучшение, любимую/нелюбимую еду и предпочтения биома.
 */
export const feedYield = (def: DragonDef, dragon: DragonState, plantId: string): number => {
  let n = def.yield_per_feed * yieldMultiplier(dragon.yield_level);

  if (def.favorite_food.includes(plantId)) n *= 1 + def.food_bonus;
  else if (def.disliked_food.includes(plantId)) n *= 1 - def.food_penalty;

  if (dragon.biome) {
    if (dragon.biome === def.favorite_biome) n *= 1 + def.biome_buff;
    else if (dragon.biome === def.disliked_biome) n *= 1 + def.biome_debuff; // biome_debuff < 0
  }

  return Math.max(1, Math.floor(n));
};

/**
 * Текущее состояние производственного цикла. `atResourceCap` считает вызывающая
 * сторона (зависит от ресурсов стора и infinite_storage).
 */
export const productionStatus = (
  dragon: DragonState,
  now: number,
  atResourceCap: boolean,
): DragonProduction => {
  if (dragon.stage !== DRAGON_STAGE.ADULT)
    return { state: PRODUCTION_STATE.HUNGRY, pending: 0, readyAt: 0, canFeed: false };

  const pending = dragon.pending_amount ?? 0;
  if (pending > 0) {
    const readyAt = dragon.producing_until ?? 0;
    return now >= readyAt
      ? { state: PRODUCTION_STATE.READY, pending, readyAt, canFeed: false }
      : { state: PRODUCTION_STATE.PRODUCING, pending, readyAt, canFeed: false };
  }

  if (atResourceCap)
    return { state: PRODUCTION_STATE.FULL, pending: 0, readyAt: 0, canFeed: false };

  return { state: PRODUCTION_STATE.HUNGRY, pending: 0, readyAt: 0, canFeed: true };
};

export const createDragonsSlice: SliceCreator<DragonsSlice> = (set, get) => ({
  dragons: [],

  addDragon: (state) => set((s) => ({ dragons: [...s.dragons, state] })),

  collectResource: (uid) => {
    const dragon = get().dragons.find((d) => d.uid === uid);
    if (!dragon) return;
    const def = ContentLoader.dragon(dragon.id);
    if (!def) return;

    const pending = dragon.pending_amount ?? 0;
    if (pending <= 0) return; // нечего собирать
    if ((dragon.producing_until ?? 0) > Date.now()) return; // ещё зреет

    // Сбор может «перелить» через MAX_RESOURCE_PER_TYPE — лимит блокирует только
    // повторное кормление (см. feedDragon), а не сбор готовой партии.
    set((s) => ({
      resources: { ...s.resources, [def.resource]: (s.resources[def.resource] ?? 0) + pending },
      dragons: s.dragons.map((d) =>
        d.uid === uid ? { ...d, pending_amount: 0, producing_until: undefined } : d,
      ),
    }));
  },

  feedDragon: (uid, plantId) => {
    const dragon = get().dragons.find((d) => d.uid === uid);
    if (!dragon) return;
    const def = ContentLoader.dragon(dragon.id);
    if (!def || dragon.stage !== DRAGON_STAGE.ADULT) return;

    // Один батч за раз: пока партия не собрана — кормить нельзя.
    if ((dragon.pending_amount ?? 0) > 0) return;

    // Склад полон — дракон «не голодный».
    const state = get();
    if (!hasInfiniteStorage(state)) {
      const current = state.resources[def.resource] ?? 0;
      if (current >= MAX_RESOURCE_PER_TYPE) return;
    }

    if (!get().spendResource(plantId, 1)) return;

    const amount = feedYield(def, dragon, plantId);
    const now = Date.now();
    set((s) => ({
      dragons: s.dragons.map((d) =>
        d.uid === uid
          ? {
              ...d,
              feedings: d.feedings + 1,
              pending_amount: amount,
              producing_until: now + def.production_duration_ms,
            }
          : d,
      ),
    }));
  },

  upgradeDragonYield: (uid) => {
    const dragon = get().dragons.find((d) => d.uid === uid);
    if (!dragon) return false;

    const level = dragon.yield_level ?? 0;
    if (level >= YIELD_UPGRADE_MAX_LEVEL) return false;
    if (!get().spendCoins(yieldUpgradeCost(level))) return false;

    set((s) => ({
      dragons: s.dragons.map((d) => (d.uid === uid ? { ...d, yield_level: level + 1 } : d)),
    }));
    return true;
  },
});
