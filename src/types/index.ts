// Типы данных игры. Соответствуют JSON-схемам из GDD (раздел «Техническая база»).

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

export type Rarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic'
  | 'ancient';

export type BiomeType =
  | 'volcanic'
  | 'lunar'
  | 'storm'
  | 'crystal'
  | 'ice'
  | 'air'
  | 'nature'
  | 'shadow'
  | 'cosmic';

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

/** Определение растения (data/plants.json). */
export interface PlantDef {
  id: string;
  name: string;
  element: Element | 'neutral';
  grow_time_minutes: number;
  native_biome: BiomeType | 'any';
  sprite: string;
  description: string;
}

// --- Будущий контент (фазы 4–5, типы заведены заранее) ---

/** Заказ от персонажа (data/orders.json). */
export interface OrderDef {
  id: string;
  npc: string;
  required_resources: { resource: string; amount: number }[];
  reward_coins: number;
  reward_xp: number;
  reward_gems?: number;
  expires_hours: number;
}

/** Остров-локация (data/islands.json). */
export interface IslandDef {
  id: string;
  name: string;
  biome: BiomeType;
  unlock_level: number;
  unlock_cost: number;
  max_nests: number;
  has_garden: boolean;
  sprite: string;
}

/** Постройка на острове (data/buildings.json). */
export interface BuildingDef {
  id: string;
  name: string;
  type: 'nest' | 'garden' | 'incubator' | 'market' | 'lab';
  unlock_level: number;
  build_cost: number;
  capacity?: number;
  sprite: string;
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

// --- Состояние сохранения (динамические данные игрока) ---

export interface DragonState {
  uid: string;          // уникальный экземпляр
  id: string;           // ссылка на DragonDef.id
  nickname?: string;
  level: number;
  stage: 'egg' | 'baby' | 'adult';
  feedings: number;     // сколько раз покормлен (для взросления)
  last_collected: number; // timestamp
  biome?: BiomeType;    // рядом с каким биомом стоит гнездо
  parent_ids?: [string, string];
}

export interface PlantSlotState {
  plant: string | null;
  planted_at: number | null;
}

export interface GardenState {
  biome: BiomeType;
  slots: PlantSlotState[];
}

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

export interface OfflineSummary {
  elapsed_ms: number;
  resources_gained: Record<string, number>;
  breeding_completed: boolean;
  eggs_hatched: number;
}
