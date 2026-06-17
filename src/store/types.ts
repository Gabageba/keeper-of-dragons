import type { StoreApi } from 'zustand';
import type GridSystem from '@/systems/GridSystem';
import type {
  DragonState,
  BreedingProgress,
  EggState,
  GardenState,
  Placement,
  OfflineSummary,
} from '@/types';

// ─── срезы (slices) ─────────────────────────────────────────────────────────

export interface GameSlice {
  player_level: number;
  xp: number;
  coins: number;
  gems: number;
  resources: Record<string, number>;
  unlocked_islands: string[];
  book_discovered: string[];

  addCoins: (n: number) => void;
  spendCoins: (n: number) => boolean;
  addGems: (n: number) => void;
  spendGems: (n: number) => boolean;
  addResource: (id: string, n: number) => void;
  spendResource: (id: string, n: number) => boolean;
  addXp: (n: number) => void;
  discoverInBook: (id: string) => void;
  unlockIsland: (id: string) => void;
}

export interface DragonsSlice {
  dragons: DragonState[];

  addDragon: (state: DragonState) => void;
  /** Тап по гнезду: начисляет накопленное производство и сбрасывает таймер. */
  collectResource: (uid: string) => void;
}

export type PlaceResult = { ok: true } | { ok: false; reason: string };

export interface IslandSlice {
  currentIslandId: string;
  placements: Record<string, Placement[]>;
  cleared_cells: Record<string, [number, number][]>;
  /** Транзиентная сетка текущего острова (не сохраняется). */
  grid: GridSystem | null;

  setCurrentIsland: (id: string) => void;
  placeBuilding: (buildingId: string, x: number, y: number, w: number, h: number) => PlaceResult;
  moveBuilding: (uid: string, x: number, y: number, w: number, h: number) => PlaceResult;
  removeBuilding: (uid: string) => void;
  clearCell: (cx: number, cy: number, cost: number) => PlaceResult;
}

export interface GardenSlice {
  gardens: GardenState[];

  plantSeed: (gardenIndex: number, slot: number, plant: string) => void;
  harvest: (gardenIndex: number, slot: number) => void;
}

export interface BreedingSlice {
  breeding: { active: BreedingProgress | null };
  incubator: EggState[];

  startBreeding: (progress: BreedingProgress) => void;
  collectBreeding: () => void;
  addEgg: (egg: EggState) => void;
  hatchEgg: (index: number) => void;
}

export interface RootSlice {
  version: number;
  last_save: number;

  /** Игровой тик (раз в секунду, из useGameTick). Обновляет таймеры в срезах. */
  tick: () => void;
  /** Начисляет оффлайн-прогресс с момента last_save. Вызывается в BootScene. */
  applyOffline: () => OfflineSummary;
  /** Полный сброс к новой игре. */
  reset: () => void;
}

export type GameStore = GameSlice &
  DragonsSlice &
  IslandSlice &
  GardenSlice &
  BreedingSlice &
  RootSlice;

/**
 * Создатель среза. Получает базовые set/get корневого стора (middleware persist и
 * subscribeWithSelector совместимы по сигнатуре), возвращает свой кусок состояния.
 */
export type SliceCreator<T> = (
  set: StoreApi<GameStore>['setState'],
  get: StoreApi<GameStore>['getState'],
) => T;

/** Максимум ресурса каждого типа, если нет дракона с infinite_storage. */
export const STORAGE_CAP = 1_000;
