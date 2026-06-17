// Типы драконов, рецептов скрещивания и их состояния. Соответствуют JSON из GDD.

import type { BiomeType } from './island';

export type Element =
  | 'fire'
  | 'water'
  | 'earth'
  | 'storm'
  | 'ice'
  | 'wind'
  | 'nature'
  | 'light'
  | 'shadow'
  | 'cosmos'
  | 'time';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'ancient';

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
  favorite_biome: BiomeType | null;
  disliked_biome: BiomeType | null;
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
  stage: 'egg' | 'baby' | 'adult';
  feedings: number; // сколько раз покормлен (для взросления)
  last_collected: number; // timestamp
  biome?: BiomeType; // рядом с каким биомом стоит гнездо
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
