import type Phaser from 'phaser';
import { useGameStore } from '@store/useGameStore';
import { useUIStore } from '@store/useUIStore';
import { MAX_RESOURCE_PER_TYPE } from '@store/types';
import { productionStatus } from '@store/slices/dragonsSlice';
import { hasInfiniteStorage } from '@store/slices/gameSlice';
import { PRODUCTION_STATE } from '@/types/dragon';
import ContentLoader from '@game/systems/ContentLoader';
import { getIslandScene } from '../gameRef';
import type { IslandCallbacks } from '@/types/bridge';
import { REGISTRY_KEY_ISLAND_CALLBACKS, REGISTRY_KEY_ON_BOOT } from '@game/shared/registry';

export const createStoreBridge = (game: Phaser.Game): (() => void) => {
  const callbacks: IslandCallbacks = {
    getGrid: () => useGameStore.getState().grid,
    getPlacements: () => {
      const s = useGameStore.getState();
      return s.placements[s.currentIslandId] ?? [];
    },
    getDragons: () => useGameStore.getState().dragons,

    placeBuilding: (...args) => useGameStore.getState().placeBuilding(...args),
    moveBuilding: (...args) => useGameStore.getState().moveBuilding(...args),

    collectNest: (nestUid) => {
      const s = useGameStore.getState();
      const placement = (s.placements[s.currentIslandId] ?? []).find((p) => p.uid === nestUid);
      if (placement?.refId) s.collectResource(placement.refId);
    },

    getProduction: (dragonUid) => {
      const idle = { state: PRODUCTION_STATE.HUNGRY, pending: 0, readyAt: 0, canFeed: false };
      const s = useGameStore.getState();
      const dragon = s.dragons.find((d) => d.uid === dragonUid);
      if (!dragon) return idle;
      const def = ContentLoader.dragon(dragon.id);
      if (!def) return idle;
      const atCap =
        !hasInfiniteStorage(s) && (s.resources[def.resource] ?? 0) >= MAX_RESOURCE_PER_TYPE;
      return productionStatus(dragon, Date.now(), atCap);
    },

    getGardenReadyCount: (gardenIndex) => {
      const s = useGameStore.getState();
      const garden = s.gardens[gardenIndex];
      if (!garden) return 0;
      let count = 0;
      for (const slot of garden.slots) {
        if (!slot.plant || !slot.planted_at) continue;
        const plantDef = ContentLoader.plant(slot.plant);
        if (!plantDef) continue;
        const nativeMatch =
          plantDef.native_biome === 'any' || plantDef.native_biome === garden.biome;
        const base = plantDef.grow_time_minutes * 60_000;
        const growMs = base / (nativeMatch ? 1.5 : 1) / (garden.hasAltar ? 1.05 : 1);
        if ((Date.now() - slot.planted_at) / growMs >= 1) count++;
      }
      return count;
    },

    openActionPanel: (uid, name, buildingId) =>
      useUIStore.getState().setActionPanel({ uid, name, buildingId }),
    openClearPanel: (cx, cy, cost) => useUIStore.getState().setClearPanel({ cx, cy, cost }),
    openGardenPanel: (uid, gardenIndex) =>
      useUIStore.getState().setGardenPanel({ uid, gardenIndex }),
    openDragonPanel: (nestUid, dragonUid) =>
      useUIStore.getState().setDragonPanel({ nestUid, dragonUid }),
    closeAllPanels: () => {
      useUIStore.getState().setActionPanel(null);
      useUIStore.getState().setClearPanel(null);
    },
    setGhostControls: (pos) => useUIStore.getState().setGhostControls(pos),
  };
  game.registry.set(REGISTRY_KEY_ISLAND_CALLBACKS, callbacks);

  game.registry.set(REGISTRY_KEY_ON_BOOT, () => {
    const store = useGameStore.getState();
    store.setCurrentIsland(store.currentIslandId);
    const summary = store.applyOffline();
    const hasGains = summary.breeding_completed || summary.eggs_hatched > 0;
    if (hasGains) useUIStore.getState().setOfflineSummary(summary);
    useUIStore.getState().setGameReady(true);
  });

  const unsubPlacements = useGameStore.subscribe(
    (s) => s.placements[s.currentIslandId],
    () => getIslandScene()?.syncBuildings(),
  );

  const unsubCleared = useGameStore.subscribe(
    (s) => s.cleared_cells[s.currentIslandId],
    () => getIslandScene()?.syncGround(),
  );

  const unsubGardens = useGameStore.subscribe(
    (s) => s.gardens,
    () => getIslandScene()?.refreshGardenSprites(),
  );

  const unsubDragons = useGameStore.subscribe(
    (s) => s.dragons,
    (dragons) => getIslandScene()?.syncNestDragons(dragons),
  );

  return () => {
    unsubPlacements();
    unsubCleared();
    unsubGardens();
    unsubDragons();
  };
};
