import GridSystem from '@game/systems/GridSystem';
import ContentLoader from '@game/systems/ContentLoader';
import type { Placement } from '@/types/island';
import type { GameStore, IslandSlice, SliceCreator } from '../types';

let uidCounter = 0;
const generatePlacementUid = (): string => {
  return `p${Date.now().toString(36)}${(uidCounter++).toString(36)}`;
};

const buildIslandGrid = (store: GameStore, islandId: string): GridSystem | null => {
  const def = ContentLoader.island(islandId);
  if (!def) return null;
  const cleared = store.cleared_cells[islandId] ?? [];
  const grid = new GridSystem(def.map, (ch) => ContentLoader.terrainOf(ch), cleared);
  for (const p of store.placements[islandId] ?? []) grid.place(p);
  return grid;
};

export const createIslandSlice: SliceCreator<IslandSlice> = (set, get) => ({
  currentIslandId: 'ashen',
  placements: {},
  cleared_cells: {},
  grid: null,

  setCurrentIsland: (id) => {
    set({ currentIslandId: id, grid: buildIslandGrid(get(), id) });
  },

  placeBuilding: (buildingId, x, y, w, h) => {
    const { grid, currentIslandId } = get();
    if (!grid?.canPlace(x, y, w, h)) return { ok: false, reason: 'Нельзя поставить здесь' };

    const cost = ContentLoader.building(buildingId)?.cost ?? 0;
    if (!get().spendCoins(cost)) return { ok: false, reason: `Нужно ${cost} монет` };

    const placement: Placement = { uid: generatePlacementUid(), buildingId, x, y, w, h };
    grid.place(placement);
    set((s) => ({
      placements: {
        ...s.placements,
        [currentIslandId]: [...(s.placements[currentIslandId] ?? []), placement],
      },
    }));
    return { ok: true };
  },

  moveBuilding: (uid, x, y, w, h) => {
    const { grid, currentIslandId } = get();
    if (!grid?.canPlace(x, y, w, h, uid)) return { ok: false, reason: 'Нельзя поставить здесь' };

    grid.remove(uid);
    const existing = (get().placements[currentIslandId] ?? []).find((p) => p.uid === uid);
    if (existing) grid.place({ ...existing, x, y, w, h });

    set((s) => ({
      placements: {
        ...s.placements,
        [currentIslandId]: (s.placements[currentIslandId] ?? []).map((p) =>
          p.uid === uid ? { ...p, x, y, w, h } : p,
        ),
      },
    }));
    return { ok: true };
  },

  removeBuilding: (uid) => {
    const { grid, currentIslandId } = get();
    grid?.remove(uid);
    set((s) => ({
      placements: {
        ...s.placements,
        [currentIslandId]: (s.placements[currentIslandId] ?? []).filter((p) => p.uid !== uid),
      },
    }));
  },

  clearCell: (cx, cy, cost) => {
    const { grid, currentIslandId } = get();
    if (!grid) return { ok: false, reason: 'Остров не готов' };
    if (!get().spendCoins(cost)) return { ok: false, reason: `Нужно ${cost} монет` };

    grid.unlock(cx, cy);
    set((s) => ({
      cleared_cells: {
        ...s.cleared_cells,
        [currentIslandId]: [...(s.cleared_cells[currentIslandId] ?? []), [cx, cy]],
      },
    }));
    return { ok: true };
  },

  updatePlacementRef: (uid, refId) => {
    const { currentIslandId } = get();
    set((s) => ({
      placements: {
        ...s.placements,
        [currentIslandId]: (s.placements[currentIslandId] ?? []).map((p) =>
          p.uid === uid ? { ...p, refId: refId ?? undefined } : p,
        ),
      },
    }));
  },
});
