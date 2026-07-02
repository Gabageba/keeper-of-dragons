import type { PlantSlotState } from '@/types/plant';
import type { GardenSlice, SliceCreator } from '../types';
import ContentLoader from '@game/systems/ContentLoader';

export const GARDEN_UPGRADE_COST = 500;

const ALTAR_SLOT_NORMAL = 4;  // центр 3×3
const ALTAR_SLOT_UPGRADED = 10; // центр 4×4: row=2, col=2 → 2*4+2=10

const altarSlotOf = (upgraded: boolean | undefined): number =>
  upgraded ? ALTAR_SLOT_UPGRADED : ALTAR_SLOT_NORMAL;

const emptySlot = (): PlantSlotState => ({ plant: null, planted_at: null });

export const createGardenSlice: SliceCreator<GardenSlice> = (set, get) => ({
  gardens: [],

  createGarden: (biome, slotCount) => {
    const index = get().gardens.length;
    const slots: PlantSlotState[] = Array.from({ length: slotCount }, emptySlot);
    set((s) => ({
      gardens: [...s.gardens, { biome, slots, upgraded: false, hasAltar: false }],
    }));
    return index;
  },

  plantSeed: (gardenIndex, slot, plant) => {
    const cost = ContentLoader.plant(plant)?.cost ?? 0;
    if (cost > 0 && !get().spendCoins(cost)) return false;
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
    return true;
  },

  harvest: (gardenIndex, slot) => {
    const garden = get().gardens[gardenIndex];
    const plantId = garden?.slots[slot]?.plant;
    if (!plantId) return;

    set((s) => ({
      gardens: s.gardens.map((g, gi) =>
        gi !== gardenIndex
          ? g
          : {
              ...g,
              slots: g.slots.map((sl, si) => (si === slot ? emptySlot() : sl)),
            },
      ),
    }));

    get().addResource(plantId, 1);
    get().addXp(10);
  },

  upgradeGarden: (gardenIndex) => {
    const garden = get().gardens[gardenIndex];
    if (!garden || garden.upgraded) return false;
    if (!get().spendCoins(GARDEN_UPGRADE_COST)) return false;

    const extraSlots: PlantSlotState[] = Array.from({ length: 7 }, emptySlot);
    set((s) => ({
      gardens: s.gardens.map((g, gi) =>
        gi !== gardenIndex
          ? g
          : { ...g, upgraded: true, slots: [...g.slots, ...extraSlots] },
      ),
    }));
    return true;
  },

  toggleAltar: (gardenIndex) => {
    const garden = get().gardens[gardenIndex];
    if (!garden) return;

    const hasAltar = !garden.hasAltar;
    const altarIdx = altarSlotOf(garden.upgraded);

    set((s) => ({
      gardens: s.gardens.map((g, gi) => {
        if (gi !== gardenIndex) return g;
        const slots = g.slots.map((sl, si) =>
          // Освобождаем слот при включении алтаря
          si === altarIdx && hasAltar ? emptySlot() : sl,
        );
        return { ...g, hasAltar, slots };
      }),
    }));
  },
});

export { altarSlotOf };
