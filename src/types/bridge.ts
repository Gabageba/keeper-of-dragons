import type GridSystem from '@game/systems/GridSystem';
import type { Placement } from '@/types/island';
import type { DragonState } from '@/types/dragon';
import type { PlaceResult } from '@store/types';
import type { GetAccumulated } from '@/types/dragon';

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
  /** Все драконы из стора (для NestSprite). */
  getDragons: () => DragonState[];

  placeBuilding: (buildingId: string, x: number, y: number, w: number, h: number) => PlaceResult;
  moveBuilding: (uid: string, x: number, y: number, w: number, h: number) => PlaceResult;

  /** Начисляет накопленное производство дракона, привязанного к гнезду по nestUid. */
  collectNest: (nestUid: string) => void;
  /** Сколько ресурса накопил дракон (без его списания). */
  getAccumulated: GetAccumulated;

  /** Сколько растений в саду готово к сбору. */
  getGardenReadyCount: (gardenIndex: number) => number;

  openActionPanel: (uid: string, name: string, buildingId: string) => void;
  openClearPanel: (cx: number, cy: number, cost: number) => void;
  openGardenPanel: (uid: string, gardenIndex: number) => void;
  closeAllPanels: () => void;
  setGhostControls: (pos: { x: number; y: number } | null) => void;
}
