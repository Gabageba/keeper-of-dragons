import type { EnumLiteralsOf } from './enumLiteralsOf';
import type { Biome } from './island';

// Типы драконов, рецептов скрещивания и их состояния. Соответствуют JSON из GDD.
export const ELEMENT = {
  FIRE: 'fire',
  WATER: 'water',
  EARTH: 'earth',
  STORM: 'storm',
  ICE: 'ice',
  WIND: 'wind',
  NATURE: 'nature',
  LIGHT: 'light',
  SHADOW: 'shadow',
  COSMOS: 'cosmos',
  TIME: 'time',
} as const;
export type Element = EnumLiteralsOf<typeof ELEMENT>;

export const RARITY = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
  MYTHIC: 'mythic',
  ANCIENT: 'ancient',
} as const;
export type Rarity = EnumLiteralsOf<typeof RARITY>;

export const DRAGON_STAGE = {
  EGG: 'egg',
  BABY: 'baby',
  ADULT: 'adult',
} as const;
type DragonStage = EnumLiteralsOf<typeof DRAGON_STAGE>;

/** Определение вида дракона (статичный контент, data/dragons.json). */
export interface DragonDef {
  id: string;
  name: string;
  element: Element;
  rarity: Rarity;
  resource: string;
  production_per_hour: number;
  favorite_food: string[];
  disliked_food: string[];
  food_bonus: number;
  favorite_biome: Biome | null;
  disliked_biome: Biome | null;
  biome_buff: number;
  biome_debuff: number;
  adaptive: boolean;
  hatch_time_minutes: number;
  grow_time_minutes: number;
  sprite: string;
  global_bonus: string | null;
  bio: string;
}

/** Рецепт скрещивания (data/breeding.json). */
export interface BreedRecipe {
  id: string;
  parent_1: string;
  parent_2: string;
  result: string;
  chance: number;
  required_plants: { plant: string; amount: number }[];
  boost_plant?: { plant: string; bonus_chance: number };
  breed_time_hours: number;
  fail_result: string;
}

// --- Состояние сохранения ---

export interface DragonState {
  uid: string; // уникальный экземпляр
  id: string; // ссылка на DragonDef.id
  nickname?: string;
  level: number;
  stage: DragonStage;
  feedings: number; // сколько раз покормлен (для взросления)
  last_collected: number; // timestamp
  biome?: Biome; // рядом с каким биомом стоит гнездо
  parent_ids?: [string, string];
}

export interface BreedingProgress {
  parent_1_uid: string;
  parent_2_uid: string;
  recipe_id: string;
  started_at: number;
  ready_at: number;
}

export interface EggState {
  dragon_id: string;
  started_at: number;
  ready_at: number;
}

export type AccumulatedInfo = { amount: number; atCap: boolean };
export type GetAccumulated = (dragonUid: string) => AccumulatedInfo;
