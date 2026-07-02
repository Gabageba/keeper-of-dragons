import { MAX_RESOURCE_PER_TYPE } from '@store/types';
import { productionStatus } from '@store/slices/dragonsSlice';
import { PRODUCTION_STATE } from '@/types/dragon';
import type { DragonState, DragonProduction } from '@/types/dragon';

export type ProductionView = {
  prod: DragonProduction;
  stored: number;
  progressPct: number; // % готовности текущей партии (0..100)
  remainingMs: number; // сколько осталось до готовности
};

/**
 * Витрина производственного цикла для модалки. Date.now() читается здесь (вне
 * рендера компонента) — компонент перерисовывается по тику и зовёт эту функцию.
 */
export const productionView = (
  dragon: DragonState,
  resourceId: string,
  resources: Record<string, number>,
  infinite: boolean,
  productionDurationMs: number,
): ProductionView => {
  const now = Date.now();
  const stored = resources[resourceId] ?? 0;
  const atCap = !infinite && stored >= MAX_RESOURCE_PER_TYPE;
  const prod = productionStatus(dragon, now, atCap);

  const remainingMs = prod.state === PRODUCTION_STATE.PRODUCING ? prod.readyAt - now : 0;
  const progressPct =
    prod.state === PRODUCTION_STATE.PRODUCING
      ? Math.round((1 - remainingMs / productionDurationMs) * 100)
      : 0;

  return { prod, stored, progressPct, remainingMs };
};

export const formatTime = (ms: number): string => {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};
