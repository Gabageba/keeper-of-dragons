import type Phaser from 'phaser';
import { useGameStore } from '@/store/useGameStore';
import { useUIStore } from '@/store/useUIStore';
import ContentLoader from '@/systems/ContentLoader';
import { getIslandScene } from '../gameRef';
import { type IslandCallbacks, REGISTRY_CALLBACKS, REGISTRY_ON_BOOT } from './types';

/**
 * storeBridge — единственная точка связи Phaser ↔ Zustand. Кладёт в registry
 * колбэки для сцены и подписывается на изменения стора, дёргая методы синка
 * визуала IslandScene (правило 2 архитектуры). Сцены сами стор не импортируют.
 */
export const createStoreBridge = (game: Phaser.Game): (() => void) => {
  const callbacks: IslandCallbacks = {
    getGrid: () => useGameStore.getState().grid,
    getPlacements: () => {
      const s = useGameStore.getState();
      return s.placements[s.currentIslandId] ?? [];
    },
    placeBuilding: (...args) => useGameStore.getState().placeBuilding(...args),
    moveBuilding: (...args) => useGameStore.getState().moveBuilding(...args),

    openActionPanel: (uid, name, buildingId) =>
      useUIStore.getState().setActionPanel({ uid, name, buildingId }),
    openClearPanel: (cx, cy, cost) => useUIStore.getState().setClearPanel({ cx, cy, cost }),
    closeAllPanels: () => {
      useUIStore.getState().setActionPanel(null);
      useUIStore.getState().setClearPanel(null);
    },
    setGhostControls: (pos) => useUIStore.getState().setGhostControls(pos),
  };
  game.registry.set(REGISTRY_CALLBACKS, callbacks);

  // Инициализация стора после загрузки контента (вызывается из BootScene). Строит
  // сетку текущего острова и начисляет оффлайн-прогресс — то, что раньше делал
  // PreloadScene напрямую через GameState.
  game.registry.set(REGISTRY_ON_BOOT, () => {
    const store = useGameStore.getState();
    store.setCurrentIsland(store.currentIslandId);
    const summary = store.applyOffline();
    const hasGains =
      Object.values(summary.resources_gained).some((v) => v > 0) ||
      summary.breeding_completed ||
      summary.eggs_hatched > 0;
    if (hasGains) useUIStore.getState().setOfflineSummary(summary);
    useUIStore.getState().setGameReady(true);
  });

  // Перерисовка построек при изменении размещений текущего острова.
  const unsubPlacements = useGameStore.subscribe(
    (s) => s.placements[s.currentIslandId],
    () => getIslandScene()?.syncBuildings(),
  );

  // Перерисовка земли при расчистке клеток.
  const unsubCleared = useGameStore.subscribe(
    (s) => s.cleared_cells[s.currentIslandId],
    () => getIslandScene()?.syncGround(),
  );

  return () => {
    unsubPlacements();
    unsubCleared();
  };
};

// Помощник для дев-меню/прочего React-кода: имя постройки по id.
export const buildingName = (buildingId: string): string => {
  return ContentLoader.building(buildingId)?.name ?? buildingId;
};
