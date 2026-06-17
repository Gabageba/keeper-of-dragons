import type { GardenSlice, SliceCreator } from '../types';

// Каркас сада: состояние и базовые экшены. Рост растений считается от planted_at
// (timestamp), поэтому отдельный per-tick инкремент не нужен — UI берёт прогресс
// из времени. См. [[useGameTick]].
export const createGardenSlice: SliceCreator<GardenSlice> = (set) => ({
  gardens: [],

  plantSeed: (gardenIndex, slot, plant) => {
    set((s) => ({
      gardens: s.gardens.map((g, gi) =>
        gi !== gardenIndex
          ? g
          : {
              ...g,
              slots: g.slots.map((sl, si) =>
                si === slot ? { plant, planted_at: Date.now() } : sl,
              ),
            },
      ),
    }));
  },

  harvest: (gardenIndex, slot) => {
    set((s) => ({
      gardens: s.gardens.map((g, gi) =>
        gi !== gardenIndex
          ? g
          : {
              ...g,
              slots: g.slots.map((sl, si) =>
                si === slot ? { plant: null, planted_at: null } : sl,
              ),
            },
      ),
    }));
  },
});
