import Phaser from 'phaser';
import {
  ISO_TILE_HALF_WIDTH,
  ISO_TILE_HALF_HEIGHT,
  ISO_BUILDING_HEIGHT,
  OCEAN_PADDING_X,
  OCEAN_PADDING_Y,
  drawIsoBox,
  isoCells,
  cellToWorld,
  worldToCell,
  calcIslandOrigin,
  topFaceVertices,
} from '@game/shared/iso';
import { GAME_CANVAS_WIDTH, GAME_CANVAS_HEIGHT } from '@game/shared/game';
import ContentLoader from '@game/systems/ContentLoader';
import type GridSystem from '@game/systems/GridSystem';
import TileGrid from '@game/objects/TileGrid';
import BuildingSprite from '@game/objects/BuildingSprite';
import NestSprite from '@game/objects/NestSprite';
import { REGISTRY_KEY_ISLAND_CALLBACKS } from '@game/shared/registry';
import type { IslandCallbacks } from '@/types/bridge';
import { PHASER_LABEL_STYLE } from '@game/shared/style';
import { calcBuildingDepth } from '../shared/building';

// ─── constants ────────────────────────────────────────────────────────────────

const DEFAULT_TILE_CLEAR_COST = 50;
const LONG_PRESS_MS = 450;
const DRAG_START_THRESHOLD_PX = 6;
const CAMERA_MAX_ZOOM = 2.0;
const OCEAN_BACKGROUND_COLOR = 0x1a3a6e;

const enum Mode {
  IDLE,
  DRAG,
  BUILD,
  MOVE,
}

interface Ghost {
  graphics: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
  cellX: number;
  cellY: number;
  w: number;
  h: number;
  buildingId: string;
  movingBuildingUid: string; // '' → новое размещение; uid → перемещение
}

// ─── scene ────────────────────────────────────────────────────────────────────

class IslandScene extends Phaser.Scene {
  private callbacks!: IslandCallbacks;

  private originX = 0;
  private originY = 0;

  private tileGrid!: TileGrid;
  private buildingSprites = new Map<string, BuildingSprite | NestSprite>();
  private ghost!: Ghost;

  private mode: Mode = Mode.IDLE;
  private pointerDownScreenPos = { x: 0, y: 0 };
  private cameraScrollAtPointerDown = { x: 0, y: 0 };
  private hasDraggedSincePointerDown = false;
  private longPressTimer: number | null = null;
  private lastPinchDistance = 0;
  private lastPinchMidpoint = { x: 0, y: 0 };
  private minZoom = 0.5;
  private ignoreNextPointerUp = false;

  private messageText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super('IslandScene');
  }

  create(): void {
    this.scale.refresh();
    this.callbacks = this.game.registry.get(REGISTRY_KEY_ISLAND_CALLBACKS) as IslandCallbacks;

    const grid = this.callbacks.getGrid();
    if (!grid) {
      this.add.text(20, 80, 'Остров не готов', { color: '#ff4444' });
      return;
    }

    ({ originX: this.originX, originY: this.originY } = calcIslandOrigin(grid.cols, grid.rows));

    this.tileGrid = new TileGrid(this, this.originX, this.originY);
    this.tileGrid.draw(grid);
    this.syncBuildings();

    this.ghost = {
      graphics: this.add.graphics().setVisible(false).setDepth(200),
      label: this.add
        .text(0, 0, '', { ...PHASER_LABEL_STYLE, fontSize: '13px' })
        .setDepth(201)
        .setVisible(false),
      cellX: 0,
      cellY: 0,
      w: 0,
      h: 0,
      buildingId: '',
      movingBuildingUid: '',
    };

    this.setupCamera(grid);
    this.setupInput();
  }

  update(): void {
    if (this.ghost.graphics.visible) {
      this.callbacks.setGhostControls(this.ghostControlsScreenPos());
    }
  }

  private get grid(): GridSystem | null {
    return this.callbacks.getGrid();
  }

  // ─── визуальный синк ─────────────────────────────────────────────────────────

  syncBuildings(): void {
    for (const sprite of this.buildingSprites.values()) sprite.destroy();
    this.buildingSprites.clear();
    const dragons = this.callbacks.getDragons();
    for (const p of this.callbacks.getPlacements()) {
      const def = ContentLoader.building(p.buildingId);
      if (def?.type === 'nest') {
        const dragon = p.refId ? (dragons.find((d) => d.uid === p.refId) ?? null) : null;
        this.buildingSprites.set(
          p.uid,
          new NestSprite(this, this.originX, this.originY, p, dragon, (uid) =>
            this.callbacks.getAccumulated(uid),
          ),
        );
      } else {
        this.buildingSprites.set(p.uid, new BuildingSprite(this, this.originX, this.originY, p));
      }
    }
  }

  syncGround(): void {
    const grid = this.grid;
    if (grid) this.tileGrid.draw(grid);
  }

  // ─── coordinate helpers ───────────────────────────────────────────────────────

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

  // ─── camera ───────────────────────────────────────────────────────────────────

  private setupCamera(grid: GridSystem): void {
    const cam = this.cameras.main;
    cam.setBackgroundColor(OCEAN_BACKGROUND_COLOR);

    let xMin = Infinity,
      xMax = -Infinity,
      yMin = Infinity,
      yMax = -Infinity;
    for (let row = 0; row < grid.rows; row++) {
      for (let col = 0; col < grid.cols; col++) {
        if (!grid.isLand(col, row)) continue;
        const { x: wx, y: wy } = cellToWorld(col, row, this.originX, this.originY);
        xMin = Math.min(xMin, wx - ISO_TILE_HALF_WIDTH);
        xMax = Math.max(xMax, wx + ISO_TILE_HALF_WIDTH);
        yMin = Math.min(yMin, wy - ISO_BUILDING_HEIGHT);
        yMax = Math.max(yMax, wy + 2 * ISO_TILE_HALF_HEIGHT);
      }
    }

    const fitW = isFinite(xMin) ? xMax - xMin + OCEAN_PADDING_X * 2 : GAME_CANVAS_WIDTH;
    const fitH = isFinite(yMin) ? yMax - yMin + OCEAN_PADDING_Y * 2 : GAME_CANVAS_HEIGHT;
    this.minZoom = Phaser.Math.Clamp(
      Math.min(GAME_CANVAS_WIDTH / fitW, GAME_CANVAS_HEIGHT / fitH),
      0.1,
      CAMERA_MAX_ZOOM,
    );
    cam.setZoom(this.minZoom);

    const viewW = GAME_CANVAS_WIDTH / this.minZoom;
    const viewH = GAME_CANVAS_HEIGHT / this.minZoom;
    const landCX = isFinite(xMin) ? (xMin + xMax) / 2 : this.originX;
    const landCY = isFinite(yMin) ? (yMin + yMax) / 2 : this.originY;
    cam.setBounds(landCX - viewW / 2, landCY - viewH / 2, viewW, viewH);

    const centre = this.tileTop((grid.cols - 1) / 2, (grid.rows - 1) / 2);
    cam.scrollX = centre.x - GAME_CANVAS_WIDTH / 2;
    cam.scrollY = centre.y - GAME_CANVAS_HEIGHT / 2;
  }

  private zoomToward(delta: number, screenX: number, screenY: number): void {
    const cam = this.cameras.main;
    const newZoom = Phaser.Math.Clamp(cam.zoom + delta, this.minZoom, CAMERA_MAX_ZOOM);
    if (newZoom === cam.zoom) return;
    const world = this.screenToWorld(screenX, screenY);
    cam.setZoom(newZoom);
    const hw = cam.width / 2;
    const hh = cam.height / 2;
    cam.scrollX = world.x - hw - (screenX - hw) / newZoom;
    cam.scrollY = world.y - hh - (screenY - hh) / newZoom;
  }

  // ─── input ────────────────────────────────────────────────────────────────────

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

    this.pointerDownScreenPos = { x: ptr.x, y: ptr.y };
    this.cameraScrollAtPointerDown = {
      x: this.cameras.main.scrollX,
      y: this.cameras.main.scrollY,
    };
    this.hasDraggedSincePointerDown = false;

    if (this.mode === Mode.IDLE) {
      this.longPressTimer = window.setTimeout(() => {
        this.longPressTimer = null;
        if (!this.hasDraggedSincePointerDown) this.onLongPress(ptr);
      }, LONG_PRESS_MS);
    }
  }

  private onPointerMove(ptr: Phaser.Input.Pointer): void {
    const { pointer1, pointer2 } = this.input;
    if (pointer1.isDown && pointer2.isDown) {
      const midX = (pointer1.x + pointer2.x) / 2;
      const midY = (pointer1.y + pointer2.y) / 2;
      const dist = Phaser.Math.Distance.Between(pointer1.x, pointer1.y, pointer2.x, pointer2.y);
      if (this.lastPinchDistance > 0) {
        const cam = this.cameras.main;
        cam.scrollX -= (midX - this.lastPinchMidpoint.x) / cam.zoom;
        cam.scrollY -= (midY - this.lastPinchMidpoint.y) / cam.zoom;
        this.zoomToward((dist - this.lastPinchDistance) * 0.005, midX, midY);
      }
      this.lastPinchDistance = dist;
      this.lastPinchMidpoint = { x: midX, y: midY };
      return;
    }

    if (this.lastPinchDistance > 0) {
      this.lastPinchDistance = 0;
      this.pointerDownScreenPos = { x: ptr.x, y: ptr.y };
      this.cameraScrollAtPointerDown = {
        x: this.cameras.main.scrollX,
        y: this.cameras.main.scrollY,
      };
      return;
    }

    if (!ptr.isDown || ptr.id > 1) return;

    const dx = ptr.x - this.pointerDownScreenPos.x;
    const dy = ptr.y - this.pointerDownScreenPos.y;
    if (Math.hypot(dx, dy) <= DRAG_START_THRESHOLD_PX) return;
    this.hasDraggedSincePointerDown = true;

    if (this.mode === Mode.BUILD || this.mode === Mode.MOVE) {
      const world = this.screenToWorld(ptr.x, ptr.y);
      this.updateGhost(world.x, world.y + ISO_BUILDING_HEIGHT);
      return;
    }

    this.clearLongPress();
    this.callbacks.closeAllPanels();
    this.mode = Mode.DRAG;
    const cam = this.cameras.main;
    cam.scrollX = this.cameraScrollAtPointerDown.x - dx / cam.zoom;
    cam.scrollY = this.cameraScrollAtPointerDown.y - dy / cam.zoom;
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
      if (!this.hasDraggedSincePointerDown)
        this.updateGhost(world.x, world.y + ISO_BUILDING_HEIGHT);
      return;
    }

    if (!this.hasDraggedSincePointerDown) this.handleTap(world.x, world.y);
    this.mode = Mode.IDLE;
  }

  private onLongPress(ptr: Phaser.Input.Pointer): void {
    this.ignoreNextPointerUp = true;
    const world = this.screenToWorld(ptr.x, ptr.y);
    const uid = this.buildingAt(world.x, world.y);
    if (uid) this.openActionPanel(uid);
  }

  private handleTap(worldX: number, worldY: number): void {
    this.callbacks.closeAllPanels();

    const uid = this.buildingAt(worldX, worldY);
    if (uid) {
      const p = this.callbacks.getPlacements().find((x) => x.uid === uid);
      const def = p ? ContentLoader.building(p.buildingId) : null;
      if (def?.type === 'nest') {
        this.callbacks.collectNest(uid);
        const sprite = this.buildingSprites.get(uid);
        if (sprite instanceof NestSprite) sprite.refresh();
        return;
      }
      this.openActionPanel(uid);
      return;
    }

    const c = this.cellAt(worldX, worldY);
    if (this.inBounds(c.x, c.y) && this.grid?.isClearable(c.x, c.y)) {
      this.callbacks.openClearPanel(c.x, c.y, DEFAULT_TILE_CLEAR_COST);
    }
  }

  private buildingAt(worldX: number, worldY: number): string | undefined {
    const grid = this.grid;
    if (!grid) return undefined;
    for (const offset of [ISO_BUILDING_HEIGHT, 0]) {
      const c = this.cellAt(worldX, worldY + offset);
      const uid = grid.occupantAt(c.x, c.y);
      if (uid) return uid;
    }
    return undefined;
  }

  private openActionPanel(uid: string): void {
    const p = this.callbacks.getPlacements().find((x) => x.uid === uid);
    if (!p) return;
    const name = ContentLoader.building(p.buildingId)?.name ?? p.buildingId;
    this.callbacks.openActionPanel(uid, name, p.buildingId);
  }

  // ─── ghost ────────────────────────────────────────────────────────────────────

  private showGhost(buildingId: string, w: number, h: number): void {
    const gh = this.ghost;
    gh.buildingId = buildingId;
    gh.w = w;
    gh.h = h;
    gh.graphics.setVisible(true);
    gh.label.setVisible(true).setText(ContentLoader.building(buildingId)?.name ?? buildingId);
  }

  private hideGhost(): void {
    this.ghost.graphics.setVisible(false);
    this.ghost.label.setVisible(false);
    this.ghost.movingBuildingUid = '';
    this.callbacks.setGhostControls(null);
  }

  private updateGhost(worldX: number, worldY: number): void {
    const grid = this.grid;
    if (!grid) return;
    const { w, h, movingBuildingUid } = this.ghost;
    const cell = this.cellAt(worldX, worldY);
    let cx: number;
    let cy: number;

    if (this.mode === Mode.MOVE) {
      const cam = this.cameras.main;
      const tl = this.screenToWorld(0, 0);
      const br = this.screenToWorld(cam.width, cam.height);

      const A = (tl.x - this.originX) / ISO_TILE_HALF_WIDTH;
      const B = (tl.y - this.originY) / ISO_TILE_HALF_HEIGHT;
      const W = (br.x - tl.x) / ISO_TILE_HALF_WIDTH;
      const H = (br.y - tl.y) / ISO_TILE_HALF_HEIGHT;

      const u0 = (worldX - this.originX) / ISO_TILE_HALF_WIDTH;
      const v0 = (worldY - this.originY) / ISO_TILE_HALF_HEIGHT;

      const u = Phaser.Math.Clamp(u0, A + h, A + W - w);
      const v = Phaser.Math.Clamp(
        v0,
        B + ISO_BUILDING_HEIGHT / ISO_TILE_HALF_HEIGHT,
        B + H - w - h,
      );

      const clamped = this.cellAt(
        this.originX + u * ISO_TILE_HALF_WIDTH,
        this.originY + v * ISO_TILE_HALF_HEIGHT,
      );
      cx = clamped.x;
      cy = clamped.y;
    } else {
      cx = Phaser.Math.Clamp(cell.x, 0, grid.cols - w);
      cy = Phaser.Math.Clamp(cell.y, 0, grid.rows - h);
    }
    this.ghost.cellX = cx;
    this.ghost.cellY = cy;

    const invalidSet = grid.invalidCells(cx, cy, w, h, movingBuildingUid || undefined);
    const g = this.ghost.graphics;
    g.clear();

    for (const { x: lx, y: ly } of isoCells(w, h)) {
      const gx = cx + lx;
      const gy = cy + ly;
      const { x: tx, y: ty } = this.tileTop(gx, gy);
      drawIsoBox(g, tx, ty, 1, 1, invalidSet.has(`${gx},${gy}`) ? 0xff2222 : 0x00ff44, 0.45);
    }

    const { x: wx, y: wy } = this.tileTop(cx, cy);
    g.lineStyle(2, invalidSet.size === 0 ? 0x00ff44 : 0xff2222, 0.95);
    g.strokePoints(topFaceVertices(wx, wy, w, h, ISO_BUILDING_HEIGHT), true);

    this.ghost.label.setPosition(
      wx + ((w - h) * ISO_TILE_HALF_WIDTH) / 2,
      wy + ((w + h) * ISO_TILE_HALF_HEIGHT) / 2 - ISO_BUILDING_HEIGHT - 14,
    );
  }

  private ghostControlsScreenPos(): { x: number; y: number } {
    const { x: wx, y: wy } = this.tileTop(this.ghost.cellX, this.ghost.cellY);
    const peakX = wx + ((this.ghost.w - this.ghost.h) * ISO_TILE_HALF_WIDTH) / 2;
    const peakY = wy - ISO_BUILDING_HEIGHT;
    const TOTAL_BUTTONS_WIDTH = 88 * 3 + 8 * 2;

    const { x: canvasX, y: canvasY } = this.worldToCanvas(peakX, peakY);
    const rect = this.game.canvas.getBoundingClientRect();
    const sx = rect.width / GAME_CANVAS_WIDTH;
    const sy = rect.height / GAME_CANVAS_HEIGHT;

    return {
      x: rect.left + canvasX * sx - TOTAL_BUTTONS_WIDTH / 2,
      y: rect.top + canvasY * sy - 46,
    };
  }

  // ─── публичные команды (React → Phaser) ──────────────────────────────────────

  enterBuildMode(buildingId: string): void {
    const def = ContentLoader.building(buildingId);
    const grid = this.grid;
    if (!def || !grid) return;

    this.mode = Mode.BUILD;
    this.ghost.movingBuildingUid = '';
    this.ignoreNextPointerUp = true;
    this.showGhost(def.id, def.w, def.h);

    const cam = this.cameras.main;
    const centre = this.cellAt(
      cam.scrollX + GAME_CANVAS_WIDTH / (2 * cam.zoom),
      cam.scrollY + GAME_CANVAS_HEIGHT / (2 * cam.zoom),
    );
    const x = Phaser.Math.Clamp(centre.x, 0, grid.cols - def.w);
    const y = Phaser.Math.Clamp(centre.y, 0, grid.rows - def.h);
    const best = grid.nearestFreeCell(x, y, def.w, def.h) ?? { x, y };
    const { x: wx, y: wy } = this.tileTop(best.x, best.y);
    this.updateGhost(wx, wy);
  }

  enterMoveMode(uid: string): void {
    const p = this.callbacks.getPlacements().find((x) => x.uid === uid);
    if (!p || !ContentLoader.building(p.buildingId)) return;

    this.mode = Mode.MOVE;
    this.ghost.movingBuildingUid = p.uid;
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
      if (this.ghost.movingBuildingUid) {
        this.buildingSprites.get(this.ghost.movingBuildingUid)?.container.setVisible(true);
      }
      this.mode = Mode.IDLE;
      this.hideGhost();
    }
    this.callbacks.closeAllPanels();
  }

  // ─── place / move ─────────────────────────────────────────────────────────────

  private tryPlaceBuilding(): void {
    const { cellX: x, cellY: y, w, h, buildingId } = this.ghost;
    const res = this.callbacks.placeBuilding(buildingId, x, y, w, h);
    if (!res.ok) return this.showMessage(res.reason);
    this.exitGhostMode();
  }

  private tryMoveBuilding(): void {
    const { movingBuildingUid: uid, cellX: x, cellY: y, w, h } = this.ghost;
    if (!uid) return;
    const res = this.callbacks.moveBuilding(uid, x, y, w, h);
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
      .text(GAME_CANVAS_WIDTH / 2, GAME_CANVAS_HEIGHT - 80, text, {
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

  private worldToCanvas(worldX: number, worldY: number): { x: number; y: number } {
    const cam = this.cameras.main;
    const hw = cam.width / 2;
    const hh = cam.height / 2;
    return {
      x: (worldX - cam.scrollX - hw) * cam.zoom + hw,
      y: (worldY - cam.scrollY - hh) * cam.zoom + hh,
    };
  }

  // Используется BuildingSprite для вычисления глубины без импорта сцены
  static depthFor = calcBuildingDepth;
}

export default IslandScene;
