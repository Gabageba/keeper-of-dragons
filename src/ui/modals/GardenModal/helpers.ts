import type { PlantDef, GardenState, PlantSlotState } from '@/types/plant';

export const GARDEN_UPGRADE_COST = 500;

const SIDE_NORMAL = 3;
const SIDE_UPGRADED = 4;

export const gardenSide = (upgraded: boolean | undefined): number =>
  upgraded ? SIDE_UPGRADED : SIDE_NORMAL;

export const altarSlotIndex = (upgraded: boolean | undefined): number => {
  const side = gardenSide(upgraded);
  return Math.floor(side / 2) * side + Math.floor(side / 2);
};

export const calcGrowMs = (plantDef: PlantDef, garden: GardenState): number => {
  const nativeMatch = plantDef.native_biome === 'any' || plantDef.native_biome === garden.biome;
  const base = plantDef.grow_time_minutes * 60_000;
  return base / (nativeMatch ? 1.5 : 1) / (garden.hasAltar ? 1.05 : 1);
};

/** 0 = росток, 1 = бутон, 2 = готово */
export const growthStage = (slot: PlantSlotState, growMs: number): 0 | 1 | 2 => {
  if (!slot.planted_at) return 0;
  const progress = (Date.now() - slot.planted_at) / growMs;
  if (progress >= 1) return 2;
  if (progress >= 0.5) return 1;
  return 0;
};

export const remainingMs = (slot: PlantSlotState, growMs: number): number => {
  if (!slot.planted_at) return growMs;
  return Math.max(0, slot.planted_at + growMs - Date.now());
};

export const formatTime = (ms: number): string => {
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}ч ${m}м`;
  if (m > 0) return `${m}м ${s}с`;
  return `${s}с`;
};
