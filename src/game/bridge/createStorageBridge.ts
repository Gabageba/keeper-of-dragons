import type Phaser from 'phaser';
import { useGameStore } from '@store/useGameStore';
import { useUIStore } from '@store/useUIStore';
import { MAX_RESOURCE_PER_TYPE } from '@store/types';
import { producedAmount } from '@store/slices/dragonsSlice';
import { hasInfiniteStorage } from '@store/slices/gameSlice';
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

    getAccumulated: (dragonUid) => {
      const s = useGameStore.getState();
      const dragon = s.dragons.find((d) => d.uid === dragonUid);
      if (!dragon || dragon.stage !== 'adult') return { amount: 0, atCap: false };
      const def = ContentLoader.dragon(dragon.id);
      if (!def) return { amount: 0, atCap: false };
      const raw = producedAmount(dragon, def, Date.now());
      const atCap = raw >= def.storage_cap;
      if (hasInfiniteStorage(s)) return { amount: raw, atCap };
      const space = MAX_RESOURCE_PER_TYPE - (s.resources[def.resource] ?? 0);
      const amount = Math.min(raw, Math.max(0, space));
      return { amount, atCap };
    },

    openActionPanel: (uid, name, buildingId) =>
      useUIStore.getState().setActionPanel({ uid, name, buildingId }),
    openClearPanel: (cx, cy, cost) => useUIStore.getState().setClearPanel({ cx, cy, cost }),
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

  return () => {
    unsubPlacements();
    unsubCleared();
  };
};
