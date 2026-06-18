// Типы растений и садов. Соответствуют JSON-схемам из GDD.

import type { Element } from './dragon';
import type { Biome } from './island';

/** Определение растения (data/plants.json). */
export interface PlantDef {
  id: string;
  name: string;
  element: Element | 'neutral';
  grow_time_minutes: number;
  native_biome: Biome | 'any';
  sprite: string;
  description: string;
}

export interface PlantSlotState {
  plant: string | null;
  planted_at: number | null;
}

export interface GardenState {
  biome: Biome;
  slots: PlantSlotState[];
}
