import type Phaser from 'phaser';
import { ISO_HALF_W, ISO_HALF_H } from '@/config';
import type GridSystem from '@/systems/GridSystem';
import { topFace, isoCells, darken, hexToInt, cellToWorld, islandRect } from '@/systems/iso';

const SEA_COLOR = 0x1a3a6e;
const SEA_BORDER = 2;
export const SEA_PAD_X = 2 * SEA_BORDER * ISO_HALF_W;
export const SEA_PAD_Y = 2 * SEA_BORDER * ISO_HALF_H;

const OCEAN_PAD = 8;
// WebGL гарантирует MAX_TEXTURE_SIZE ≥ 4096. При OCEAN_PAD=8 и сетке 20×16
// ширина фона = 4864 px → делим на два чанка.
const MAX_TEX = 4096;
const TEX_PREFIX = '__tileGrid_';

interface ChunkLayout {
  bounds: { x: number; y: number; w: number; h: number };
  lox: number; // смещение world-origin в пространство текстуры
  loy: number;
  numChunks: number;
}

/**
 * TileGrid — рендер изометрического фона острова + океана. Запекается через
 * generateTexture → Image (один quad/чанк в кадр). Поддерживает предзагрузку
 * из BootScene через TileGrid.prebake() — тогда first draw() пропускает бейкинг.
 */
class TileGrid {
  private sprites: Phaser.GameObjects.Image[] = [];
  private texKeys: string[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly originX: number,
    private readonly originY: number,
  ) {}

  /** Вызывается из BootScene: запекает текстуры до старта IslandScene. */
  static prebake(scene: Phaser.Scene, grid: GridSystem, originX: number, originY: number): void {
    TileGrid.bakeChunks(scene, grid, TileGrid.computeLayout(originX, originY, grid));
  }

  draw(grid: GridSystem): void {
    for (const s of this.sprites) s.destroy();
    this.sprites = [];
    for (const key of this.texKeys) {
      if (this.scene.textures.exists(key)) this.scene.textures.remove(key);
    }
    this.texKeys = [];

    const lay = TileGrid.computeLayout(this.originX, this.originY, grid);
    const { bounds, numChunks } = lay;

    for (let ci = 0; ci < numChunks; ci++) this.texKeys.push(`${TEX_PREFIX}${ci}`);

    // Пропускаем бейкинг, если тексуры уже есть (prebake из BootScene).
    if (!this.scene.textures.exists(this.texKeys[0])) {
      TileGrid.bakeChunks(this.scene, grid, lay);
    }

    for (let ci = 0; ci < numChunks; ci++) {
      this.sprites.push(
        this.scene.add.image(bounds.x + ci * MAX_TEX, bounds.y, this.texKeys[ci]).setOrigin(0, 0),
      );
    }
  }

  // ─── private helpers ──────────────────────────────────────────────────────

  private static computeLayout(originX: number, originY: number, grid: GridSystem): ChunkLayout {
    const { cols, rows } = grid;
    const extCols = cols + 2 * OCEAN_PAD;
    const extRows = rows + 2 * OCEAN_PAD;
    const extOriginY = originY - 2 * OCEAN_PAD * ISO_HALF_H;
    const bounds = islandRect(originX, extOriginY, extCols, extRows, SEA_PAD_X, SEA_PAD_Y);
    return {
      bounds,
      lox: originX - bounds.x,
      loy: originY - bounds.y,
      numChunks: Math.ceil(bounds.w / MAX_TEX),
    };
  }

  private static bakeChunks(
    scene: Phaser.Scene,
    grid: GridSystem,
    { bounds, lox, loy, numChunks }: ChunkLayout,
  ): void {
    const { cols, rows } = grid;
    const extCols = cols + 2 * OCEAN_PAD;
    const extRows = rows + 2 * OCEAN_PAD;

    for (let ci = 0; ci < numChunks; ci++) {
      const chunkOffX = ci * MAX_TEX;
      const chunkW = Math.min(MAX_TEX, bounds.w - chunkOffX);

      const g = scene.add.graphics();
      g.fillStyle(SEA_COLOR, 1);
      g.fillRect(0, 0, chunkW, bounds.h);

      const drawTile = (tx: number, ty: number, color: number, strokeAlpha: number) => {
        const lx = tx - chunkOffX;
        // Тайл не пересекается с этим чанком — пропускаем.
        if (lx + ISO_HALF_W < 0 || lx - ISO_HALF_W > chunkW) return;
        const pts = topFace(lx, ty, 1, 1);
        g.fillStyle(color, 1);
        g.fillPoints(pts, true);
        g.lineStyle(1, 0x000000, strokeAlpha);
        g.strokePoints(pts, true);
      };

      for (const { x: ex, y: ey } of isoCells(extCols, extRows)) {
        const cx = ex - OCEAN_PAD;
        const cy = ey - OCEAN_PAD;
        if (cx >= 0 && cx < cols && cy >= 0 && cy < rows) continue;
        const { x: tx, y: ty } = cellToWorld(cx, cy, lox, loy);
        drawTile(tx, ty, SEA_COLOR, 0.15);
      }

      for (const { x: cx, y: cy } of isoCells(cols, rows)) {
        const terrain = grid.terrainAt(cx, cy);
        if (!terrain) continue;
        const base = terrain.land ? hexToInt(terrain.color) : SEA_COLOR;
        const color = terrain.buildable && !grid.isUnlocked(cx, cy) ? darken(base, 0.5) : base;
        const { x: tx, y: ty } = cellToWorld(cx, cy, lox, loy);
        drawTile(tx, ty, color, 0.22);
      }

      g.generateTexture(`${TEX_PREFIX}${ci}`, chunkW, bounds.h);
      g.destroy();
    }
  }
}

export default TileGrid;
