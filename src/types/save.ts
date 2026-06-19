import type { DragonState, BreedingProgress, EggState } from './dragon';
import type { GardenState } from './plant';
import type { Placement } from './island';

/** Снимок прогресса игрока. Форма соответствует persisted-блобу useGameStore. */
export interface SaveData {
  version: number;
  player_level: number;
  xp: number;
  coins: number;
  gems: number;
  unlocked_islands: string[];
  dragons: DragonState[];
  book_discovered: string[];
  gardens: GardenState[];
  resources: Record<string, number>;
  breeding: { active: BreedingProgress | null };
  incubator: EggState[];
  last_save: number;
  /** Размещения построек: islandId → список. */
  placements: Record<string, Placement[]>;
  /** Дополнительно расчищенные клетки: islandId → список координат. */
  cleared_cells: Record<string, [number, number][]>;
}

export interface OfflineSummary {
  elapsed_ms: number;
  breeding_completed: boolean;
  eggs_hatched: number;
}
