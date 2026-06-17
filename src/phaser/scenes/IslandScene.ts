import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, ISO_HALF_W, ISO_HALF_H, ISO_BLDG_H } from '@/config';
import ContentLoader from '@/systems/ContentLoader';
import type GridSystem from '@/systems/GridSystem';
import {
  drawIsoBox,
  topFace,
  isoCells,
  cellToWorld,
  worldToCell,
  islandRect,
  islandOrigin,
} from '@/systems/iso';
import TileGrid, { SEA_PAD_X, SEA_PAD_Y } from '../objects/TileGrid';
import BuildingSprite, { LABEL_STYLE } from '../objects/BuildingSprite';
import { type IslandCallbacks, REGISTRY_CALLBACKS } from '../bridge/types';

// ─── constants ────────────────────────────────────────────────────────────────

const CLEAR_COST = 50;
const LONG_PRESS_MS = 450;
const DRAG_THRESHOLD = 6; // px
const ZOOM_MAX = 2.0;
const SEA_COLOR = 0x1a3a6e;
const OCEAN_SCROLL = 1; // лишние изо-тайлы открытого океана за нарисованным морем

const enum Mode {
  IDLE,
  DRAG,
  BUILD,
  MOVE,
}

interface Ghost {
  gfx: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
  cellX: number;
  cellY: number;
  w: number;
  h: number;
  buildingId: string;
  movingUid: string; // '' → размещение нового; uid → перемещение существующего
}

// ─── scene ────────────────────────────────────────────────────────────────────

/**
 * IslandScene — ТОЛЬКО рендер острова и ввод. Игровое состояние живёт в Zustand;
 * сцена читает сетку/постройки и вызывает экшены через IslandCallbacks из registry
 * (мост). Ghost-режим (превью постройки/перемещения) — чисто визуальное состояние
 * интеракции, поэтому остаётся в сцене.
 */
class IslandScene extends Phaser.Scene {
  private cb!: IslandCallbacks;

  // Мировое начало = северная вершина ромба клетки (0,0)
  private originX = 0;
  private originY = 0;

  private tileGrid!: TileGrid;
  private buildingSprites = new Map<string, BuildingSprite>();
  private ghost!: Ghost;

  // Состояние жеста/указателя
  private mode: Mode = Mode.IDLE;
  private ptrDownScreen = { x: 0, y: 0 };
  private camStartScroll = { x: 0, y: 0 };
  private didDrag = false;
  private longPressTimer: number | null = null;
  private lastPinchDist = 0;
  private lastPinchMid = { x: 0, y: 0 };
  private zoomMin = 0.5;
  // Глушит pointer-up, активировавший BUILD/MOVE, чтобы он сразу не разместил.
  private ignoreNextPointerUp = false;

  private messageText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super('IslandScene');
  }

  create(): void {
    this.scale.refresh();
    this.cb = this.game.registry.get(REGISTRY_CALLBACKS) as IslandCallbacks;

    const grid = this.cb.getGrid();
    if (!grid) {
      this.add.text(20, 80, 'Остров не готов', { color: '#ff4444' });
      return;
    }

    ({ originX: this.originX, originY: this.originY } = islandOrigin(grid.cols, grid.rows));

    this.tileGrid = new TileGrid(this, this.originX, this.originY);
    this.tileGrid.draw(grid);
    this.syncBuildings();

    // Ghost рисуется поверх всех построек.
    this.ghost = {
      gfx: this.add.graphics().setVisible(false).setDepth(200),
      label: this.add
        .text(0, 0, '', { ...LABEL_STYLE, fontSize: '13px' })
        .setDepth(201)
        .setVisible(false),
      cellX: 0,
      cellY: 0,
      w: 0,
      h: 0,
      buildingId: '',
      movingUid: '',
    };

    this.setupCamera(grid);
    this.setupInput();
  }

  update(): void {
    if (this.ghost.gfx.visible) {
      this.cb.setGhostControls(this.ghostControlsScreenPos());
    }
  }

  private get grid(): GridSystem | null {
    return this.cb.getGrid();
  }

  // ─── визуальный синк (вызывается мостом) ───────────────────────────────────────

  /** Перестраивает спрайты построек из стора. */
  syncBuildings(): void {
    for (const sprite of this.buildingSprites.values()) sprite.destroy();
    this.buildingSprites.clear();
    for (const p of this.cb.getPlacements()) {
      this.buildingSprites.set(p.uid, new BuildingSprite(this, this.originX, this.originY, p));
    }
  }

  /** Перерисовывает землю (после расчистки клетки). */
  syncGround(): void {
    const grid = this.grid;
    if (grid) this.tileGrid.draw(grid);
  }

  // ─── coordinate helpers ──────────────────────────────────────────────────────

  private tileTop(cx: number, cy: number): { x: number; y: number } {
    return cellToWorld(cx, cy, this.originX, this.originY);
  }

  private cellAt(worldX: number, worldY: number): { x: number; y: number } {
    return worldToCell(worldX, worldY, this.originX, this.originY);
  }

  private inBounds(x: number, y: number): boolean {
    const grid = this.grid;
    return !!grid && x >= 0 && x < grid.cols && y >= 0 && y < grid.rows;
  }

  // ─── camera ──────────────────────────────────────────────────────────────────

  private setupCamera(grid: GridSystem): void {
    const cam = this.cameras.main;
    cam.setBackgroundColor(SEA_COLOR);

    // Считаем bounding box только по СУШЕ: grid.cols/rows включают клетки-море по краям,
    // поэтому bounds камеры по всей сетке позволяют уйти далеко в открытый океан.
    let xMin = Infinity,
      xMax = -Infinity,
      yMin = Infinity,
      yMax = -Infinity;
    for (let row = 0; row < grid.rows; row++) {
      for (let col = 0; col < grid.cols; col++) {
        if (!grid.isLand(col, row)) continue;
        const { x: wx, y: wy } = cellToWorld(col, row, this.originX, this.originY);
        xMin = Math.min(xMin, wx - ISO_HALF_W);
        xMax = Math.max(xMax, wx + ISO_HALF_W);
        yMin = Math.min(yMin, wy - ISO_BLDG_H);
        yMax = Math.max(yMax, wy + 2 * ISO_HALF_H);
      }
    }

    const scrollPadX = SEA_PAD_X + 2 * OCEAN_SCROLL * ISO_HALF_W;
    const scrollPadY = SEA_PAD_Y + 2 * OCEAN_SCROLL * ISO_HALF_H;

    const bounds = isFinite(xMin)
      ? {
          x: xMin - scrollPadX,
          y: yMin - scrollPadY,
          w: xMax - xMin + scrollPadX * 2,
          h: yMax - yMin + scrollPadY * 2,
        }
      : islandRect(this.originX, this.originY, grid.cols, grid.rows, scrollPadX, scrollPadY);
    cam.setBounds(bounds.x, bounds.y, bounds.w, bounds.h);

    const fitW = isFinite(xMin) ? xMax - xMin + SEA_PAD_X * 2 : bounds.w;
    const fitH = isFinite(yMin) ? yMax - yMin + SEA_PAD_Y * 2 : bounds.h;
    this.zoomMin = Phaser.Math.Clamp(
      Math.min(GAME_WIDTH / fitW, GAME_HEIGHT / fitH),
      0.1,
      ZOOM_MAX,
    );
    cam.setZoom(this.zoomMin);

    const centre = this.tileTop((grid.cols - 1) / 2, (grid.rows - 1) / 2);
    cam.scrollX = centre.x - GAME_WIDTH / 2;
    cam.scrollY = centre.y - GAME_HEIGHT / 2;
  }

  private zoomToward(delta: number, screenX: number, screenY: number): void {
    const cam = this.cameras.main;
    const newZoom = Phaser.Math.Clamp(cam.zoom + delta, this.zoomMin, ZOOM_MAX);
    if (newZoom === cam.zoom) return;
    // Фиксируем мировую точку под курсором до смены zoom,
    // затем пересчитываем scroll через обратную формулу worldToCanvas.
    const world = this.screenToWorld(screenX, screenY);
    cam.setZoom(newZoom);
    const hw = cam.width / 2;
    const hh = cam.height / 2;
    cam.scrollX = world.x - hw - (screenX - hw) / newZoom;
    cam.scrollY = world.y - hh - (screenY - hh) / newZoom;
  }

  // ─── input ───────────────────────────────────────────────────────────────────

  private setupInput(): void {
    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerup', this.onPointerUp, this);
    this.input.on('wheel', (p: Phaser.Input.Pointer, _o: unknown, _dx: number, dy: number) =>
      this.zoomToward(-dy * 0.001, p.x, p.y),
    );
    this.input.keyboard?.on('keydown-ESC', this.ghostCancel, this);
  }

  private clearLongPress(): void {
    if (this.longPressTimer !== null) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  private onPointerDown(ptr: Phaser.Input.Pointer): void {
    if (ptr.id > 1) return;

    this.ptrDownScreen = { x: ptr.x, y: ptr.y };
    this.camStartScroll = { x: this.cameras.main.scrollX, y: this.cameras.main.scrollY };
    this.didDrag = false;

    if (this.mode === Mode.IDLE) {
      this.longPressTimer = window.setTimeout(() => {
        this.longPressTimer = null;
        if (!this.didDrag) this.onLongPress(ptr);
      }, LONG_PRESS_MS);
    }
  }

  private onPointerMove(ptr: Phaser.Input.Pointer): void {
    const { pointer1, pointer2 } = this.input;
    if (pointer1.isDown && pointer2.isDown) {
      const midX = (pointer1.x + pointer2.x) / 2;
      const midY = (pointer1.y + pointer2.y) / 2;
      const dist = Phaser.Math.Distance.Between(pointer1.x, pointer1.y, pointer2.x, pointer2.y);
      if (this.lastPinchDist > 0) {
        // Pan: двигаем камеру вслед за серединой пальцев
        const cam = this.cameras.main;
        cam.scrollX -= (midX - this.lastPinchMid.x) / cam.zoom;
        cam.scrollY -= (midY - this.lastPinchMid.y) / cam.zoom;
        // Zoom к текущей середине
        this.zoomToward((dist - this.lastPinchDist) * 0.005, midX, midY);
      }
      this.lastPinchDist = dist;
      this.lastPinchMid = { x: midX, y: midY };
      return;
    }

    if (this.lastPinchDist > 0) {
      // Переход от пинча к одному пальцу — сбрасываем якорь пана, чтобы не было прыжка
      this.lastPinchDist = 0;
      this.ptrDownScreen = { x: ptr.x, y: ptr.y };
      this.camStartScroll = { x: this.cameras.main.scrollX, y: this.cameras.main.scrollY };
      return;
    }

    if (!ptr.isDown || ptr.id > 1) return;

    const dx = ptr.x - this.ptrDownScreen.x;
    const dy = ptr.y - this.ptrDownScreen.y;
    if (Math.hypot(dx, dy) <= DRAG_THRESHOLD) return;
    this.didDrag = true;

    if (this.mode === Mode.BUILD || this.mode === Mode.MOVE) {
      // Крыша ghost'а на ISO_BLDG_H выше поверхности — смещаем, чтобы тянулась за курсором.
      const world = this.screenToWorld(ptr.x, ptr.y);
      this.updateGhost(world.x, world.y + ISO_BLDG_H);
      return;
    }

    this.clearLongPress();
    this.cb.closeAllPanels();
    this.mode = Mode.DRAG;
    const cam = this.cameras.main;
    cam.scrollX = this.camStartScroll.x - dx / cam.zoom;
    cam.scrollY = this.camStartScroll.y - dy / cam.zoom;
  }

  private onPointerUp(ptr: Phaser.Input.Pointer): void {
    if (ptr.id > 1) return;
    this.clearLongPress();

    if (this.ignoreNextPointerUp) {
      this.ignoreNextPointerUp = false;
      return;
    }

    if (this.mode === Mode.DRAG) {
      this.mode = Mode.IDLE;
      return;
    }

    const world = this.screenToWorld(ptr.x, ptr.y);

    if (this.mode === Mode.BUILD || this.mode === Mode.MOVE) {
      if (!this.didDrag) this.updateGhost(world.x, world.y + ISO_BLDG_H);
      return;
    }

    if (!this.didDrag) this.handleTap(world.x, world.y);
    this.mode = Mode.IDLE;
  }

  private onLongPress(ptr: Phaser.Input.Pointer): void {
    const world = this.screenToWorld(ptr.x, ptr.y);
    const uid = this.buildingAt(world.x, world.y);
    if (uid) this.openActionPanel(uid);
  }

  private handleTap(worldX: number, worldY: number): void {
    this.cb.closeAllPanels();

    const uid = this.buildingAt(worldX, worldY);
    if (uid) {
      this.openActionPanel(uid);
      return;
    }

    // Нет постройки — предлагаем расчистить закрытую землю под курсором.
    const c = this.cellAt(worldX, worldY);
    if (this.inBounds(c.x, c.y) && this.grid?.isClearable(c.x, c.y)) {
      this.cb.openClearPanel(c.x, c.y, CLEAR_COST);
    }
  }

  /** uid постройки под мировой точкой; крыши рисуются на ISO_BLDG_H выше тайла. */
  private buildingAt(worldX: number, worldY: number): string | undefined {
    const grid = this.grid;
    if (!grid) return undefined;
    for (const offset of [ISO_BLDG_H, 0]) {
      const c = this.cellAt(worldX, worldY + offset);
      const uid = grid.occupantAt(c.x, c.y);
      if (uid) return uid;
    }
    return undefined;
  }

  private openActionPanel(uid: string): void {
    const p = this.cb.getPlacements().find((x) => x.uid === uid);
    if (!p) return;
    const name = ContentLoader.building(p.buildingId)?.name ?? p.buildingId;
    this.cb.openActionPanel(uid, name, p.buildingId);
  }

  // ─── ghost (build / move preview) ──────────────────────────────────────────────

  private showGhost(buildingId: string, w: number, h: number): void {
    const gh = this.ghost;
    gh.buildingId = buildingId;
    gh.w = w;
    gh.h = h;
    gh.gfx.setVisible(true);
    gh.label.setVisible(true).setText(ContentLoader.building(buildingId)?.name ?? buildingId);
  }

  private hideGhost(): void {
    this.ghost.gfx.setVisible(false);
    this.ghost.label.setVisible(false);
    this.ghost.movingUid = '';
    this.cb.setGhostControls(null);
  }

  private updateGhost(worldX: number, worldY: number): void {
    const grid = this.grid;
    if (!grid) return;
    const { w, h, movingUid } = this.ghost;
    const cell = this.cellAt(worldX, worldY);
    let cx: number;
    let cy: number;

    if (this.mode === Mode.MOVE) {
      // Clamp in iso diagonal coords: u = cx-cy (left/right), v = cx+cy (top/bottom).
      // Use screenToWorld for viewport corners — cam.scrollX is NOT the world left edge at zoom≠1.
      const cam = this.cameras.main;
      const tl = this.screenToWorld(0, 0);
      const br = this.screenToWorld(cam.width, cam.height);

      const A = (tl.x - this.originX) / ISO_HALF_W;
      const B = (tl.y - this.originY) / ISO_HALF_H;
      const W = (br.x - tl.x) / ISO_HALF_W;
      const H = (br.y - tl.y) / ISO_HALF_H;

      const u0 = (worldX - this.originX) / ISO_HALF_W;
      const v0 = (worldY - this.originY) / ISO_HALF_H;

      // Keep entire building footprint within the camera viewport.
      const u = Phaser.Math.Clamp(u0, A + h, A + W - w);
      const v = Phaser.Math.Clamp(v0, B + ISO_BLDG_H / ISO_HALF_H, B + H - w - h);

      const clamped = this.cellAt(this.originX + u * ISO_HALF_W, this.originY + v * ISO_HALF_H);
      cx = clamped.x;
      cy = clamped.y;
    } else {
      cx = Phaser.Math.Clamp(cell.x, 0, grid.cols - w);
      cy = Phaser.Math.Clamp(cell.y, 0, grid.rows - h);
    }
    this.ghost.cellX = cx;
    this.ghost.cellY = cy;

    const invalid = grid.invalidCells(cx, cy, w, h, movingUid || undefined);
    const g = this.ghost.gfx;
    g.clear();

    for (const { x: lx, y: ly } of isoCells(w, h)) {
      const gx = cx + lx;
      const gy = cy + ly;
      const { x: tx, y: ty } = this.tileTop(gx, gy);
      drawIsoBox(g, tx, ty, 1, 1, invalid.has(`${gx},${gy}`) ? 0xff2222 : 0x00ff44, 0.45);
    }

    const { x: wx, y: wy } = this.tileTop(cx, cy);
    g.lineStyle(2, invalid.size === 0 ? 0x00ff44 : 0xff2222, 0.95);
    g.strokePoints(topFace(wx, wy, w, h, ISO_BLDG_H), true);

    this.ghost.label.setPosition(
      wx + ((w - h) * ISO_HALF_W) / 2,
      wy + ((w + h) * ISO_HALF_H) / 2 - ISO_BLDG_H - 14,
    );
  }

  /** Экранная позиция (для DOM-кнопок) над верхушкой призрака. */
  private ghostControlsScreenPos(): { x: number; y: number } {
    const { x: wx, y: wy } = this.tileTop(this.ghost.cellX, this.ghost.cellY);
    const peakX = wx + ((this.ghost.w - this.ghost.h) * ISO_HALF_W) / 2;
    const peakY = wy - ISO_BLDG_H;
    const TOTAL_W = 88 * 3 + 8 * 2;

    const { x: canvasX, y: canvasY } = this.worldToCanvas(peakX, peakY);
    const rect = this.game.canvas.getBoundingClientRect();
    const sx = rect.width / GAME_WIDTH;
    const sy = rect.height / GAME_HEIGHT;

    return {
      x: rect.left + canvasX * sx - TOTAL_W / 2,
      y: rect.top + canvasY * sy - 46,
    };
  }

  // ─── публичные команды (React → Phaser через usePhaserBridge) ────────────────────

  enterBuildMode(buildingId: string): void {
    const def = ContentLoader.building(buildingId);
    const grid = this.grid;
    if (!def || !grid) return;

    this.mode = Mode.BUILD;
    this.ghost.movingUid = '';
    this.ignoreNextPointerUp = true;
    this.showGhost(def.id, def.w, def.h);

    const cam = this.cameras.main;
    const centre = this.cellAt(
      cam.scrollX + GAME_WIDTH / (2 * cam.zoom),
      cam.scrollY + GAME_HEIGHT / (2 * cam.zoom),
    );
    const x = Phaser.Math.Clamp(centre.x, 0, grid.cols - def.w);
    const y = Phaser.Math.Clamp(centre.y, 0, grid.rows - def.h);
    const best = grid.nearestFreeCell(x, y, def.w, def.h) ?? { x, y };
    const { x: wx, y: wy } = this.tileTop(best.x, best.y);
    this.updateGhost(wx, wy);
  }

  enterMoveMode(uid: string): void {
    const p = this.cb.getPlacements().find((x) => x.uid === uid);
    if (!p || !ContentLoader.building(p.buildingId)) return;

    this.mode = Mode.MOVE;
    this.ghost.movingUid = p.uid;
    this.ignoreNextPointerUp = true;
    this.showGhost(p.buildingId, p.w, p.h);
    this.buildingSprites.get(p.uid)?.container.setVisible(false);
    const { x: wx, y: wy } = this.tileTop(p.x, p.y);
    this.updateGhost(wx, wy);
  }

  ghostRotate(): void {
    [this.ghost.w, this.ghost.h] = [this.ghost.h, this.ghost.w];
    const { x: wx, y: wy } = this.tileTop(this.ghost.cellX, this.ghost.cellY);
    this.updateGhost(wx, wy);
  }

  ghostConfirm(): void {
    if (this.mode === Mode.BUILD) this.tryPlaceBuilding();
    else if (this.mode === Mode.MOVE) this.tryMoveBuilding();
  }

  ghostCancel(): void {
    if (this.mode === Mode.BUILD || this.mode === Mode.MOVE) {
      if (this.ghost.movingUid) {
        this.buildingSprites.get(this.ghost.movingUid)?.container.setVisible(true);
      }
      this.mode = Mode.IDLE;
      this.hideGhost();
    }
    this.cb.closeAllPanels();
  }

  // ─── place / move (коммит через стор) ───────────────────────────────────────────

  private tryPlaceBuilding(): void {
    const { cellX: x, cellY: y, w, h, buildingId } = this.ghost;
    const res = this.cb.placeBuilding(buildingId, x, y, w, h);
    if (!res.ok) return this.showMessage(res.reason);
    this.exitGhostMode();
  }

  private tryMoveBuilding(): void {
    const { movingUid: uid, cellX: x, cellY: y, w, h } = this.ghost;
    if (!uid) return;
    const res = this.cb.moveBuilding(uid, x, y, w, h);
    if (!res.ok) return this.showMessage(res.reason);
    this.exitGhostMode();
  }

  private exitGhostMode(): void {
    this.mode = Mode.IDLE;
    this.hideGhost();
  }

  private showMessage(text: string): void {
    this.messageText?.destroy();
    this.messageText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 80, text, {
        fontFamily: 'serif',
        fontSize: '18px',
        color: '#ff6b6b',
        backgroundColor: '#13101ecc',
        padding: { x: 10, y: 4 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(50);
    this.time.delayedCall(2000, () => {
      this.messageText?.destroy();
      this.messageText = null;
    });
  }

  private screenToWorld(sx: number, sy: number): { x: number; y: number } {
    return this.cameras.main.getWorldPoint(sx, sy);
  }

  /** Мировые координаты → позиция в canvas-пространстве (game units, без учёта display scale). */
  private worldToCanvas(worldX: number, worldY: number): { x: number; y: number } {
    const cam = this.cameras.main;
    const hw = cam.width / 2;
    const hh = cam.height / 2;
    return {
      x: (worldX - cam.scrollX - hw) * cam.zoom + hw,
      y: (worldY - cam.scrollY - hh) * cam.zoom + hh,
    };
  }
}

export default IslandScene;
