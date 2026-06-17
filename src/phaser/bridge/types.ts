import type GridSystem from '@/systems/GridSystem';
import type { Placement } from '@/types';
import type { PlaceResult } from '@/store/types';

/**
 * Граница Phaser → стор. IslandScene получает этот объект из game.registry и
 * общается со стором ТОЛЬКО через него (правило 1 архитектуры): команды вызывают
 * экшены стора, запросы читают (только чтение!) транзиентную сетку, UI-колбэки
 * пишут в useUIStore. Сама сцена стор не импортирует.
 */
export interface IslandCallbacks {
  /** Живая сетка текущего острова для рендера/хит-теста (только чтение). */
  getGrid: () => GridSystem | null;
  /** Постройки текущего острова (для синка спрайтов). */
  getPlacements: () => Placement[];

  placeBuilding: (buildingId: string, x: number, y: number, w: number, h: number) => PlaceResult;
  moveBuilding: (uid: string, x: number, y: number, w: number, h: number) => PlaceResult;

  openActionPanel: (uid: string, name: string, buildingId: string) => void;
  openClearPanel: (cx: number, cy: number, cost: number) => void;
  closeAllPanels: () => void;
  setGhostControls: (pos: { x: number; y: number } | null) => void;
}

export const REGISTRY_CALLBACKS = 'islandCallbacks';

/** Ключ registry: колбэк инициализации стора, вызывается BootScene после загрузки контента. */
export const REGISTRY_ON_BOOT = 'onBoot';
