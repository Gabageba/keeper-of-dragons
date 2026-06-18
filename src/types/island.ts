import type { Element } from './dragon';
import type { EnumLiteralsOf } from './enumLiteralsOf';

// Типы острова, рельефа и размещений. Соответствуют JSON-схемам из GDD.
export const BIOME = {
  VOLCANIC: 'volcanic',
  LUNAR: 'lunar',
  STORM: 'storm',
  CRYSTAL: 'crystal',
  ICE: 'ice',
  AIR: 'air',
  NATURE: 'nature',
  SHADOW: 'shadow',
  COSMIC: 'cosmic',
} as const;
export type Biome = EnumLiteralsOf<typeof BIOME>;

/**
 * Тип клетки острова (data/terrain.json). Легенда символов общая для всех островов:
 * символ в IslandDef.map → TerrainDef.
 */
export interface TerrainDef {
  /** Машинный id типа: sea / ground / mountain / water … */
  kind: string;
  /** Человекочитаемое имя (для UI/дев-меню). */
  name: string;
  /** Рисуется ли как суша. false — клетка показывает фон-море. */
  land: boolean;
  /** Можно ли строить на клетке (после открытия). */
  buildable: boolean;
  /** Для buildable-земли: открыта ли клетка с самого начала (иначе расчищается за монеты). */
  unlocked?: boolean;
  /** Цвет заливки ромба "#rrggbb". */
  color: string;
  /** Хук под спрайт тайла (пока не используется — рисуем цветом). */
  sprite?: string;
}

/**
 * Остров-локация (data/islands.json). Форма и типы клеток задаются текстовой
 * картой: массив строк, каждый символ — тип клетки из terrain.json.
 * Размер сетки выводится из карты (cols = длина самой длинной строки, rows = число строк).
 */
export interface IslandDef {
  id: string;
  name: string;
  biome: Biome;
  unlock_level: number;
  unlock_cost: number;
  /** Карта острова. Каждый символ — ключ в terrain.json. Строки могут быть разной длины. */
  map: string[];
  sprite?: string;
}

/** Размещённое здание/объект на сетке острова. */
export interface Placement {
  uid: string;
  buildingId: string; // ссылка на BuildingDef.id
  refId?: string; // ссылка на dragon uid / garden uid и т.п.
  x: number; // левый-верхний угол в клетках
  y: number;
  w: number;
  h: number;
}

/** Маршрут экспедиции (data/expeditions.json). */
export interface ExpeditionRouteDef {
  id: string;
  name: string;
  destination: string;
  duration_hours: number;
  unlock_level: number;
  required_dragon_element?: Element;
  reward_resources: { resource: string; min: number; max: number }[];
  sprite: string;
}

export interface IslandPoint {
  x: number;
  y: number;
}
