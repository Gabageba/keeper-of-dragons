import type { BreedingSlice, SliceCreator } from '../types';

// Каркас скрещивания и инкубатора. Готовность считается от ready_at (timestamp);
// UI берёт прогресс/готовность из времени, поэтому per-tick мутаций не требуется.
export const createBreedingSlice: SliceCreator<BreedingSlice> = (set) => ({
  breeding: { active: null },
  incubator: [],

  startBreeding: (progress) => set({ breeding: { active: progress } }),

  collectBreeding: () => set({ breeding: { active: null } }),

  addEgg: (egg) => set((s) => ({ incubator: [...s.incubator, egg] })),

  hatchEgg: (index) => set((s) => ({ incubator: s.incubator.filter((_, i) => i !== index) })),
});
