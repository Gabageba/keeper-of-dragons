import type Phaser from 'phaser';
import {
  ISO_TILE_HALF_WIDTH,
  ISO_TILE_HALF_HEIGHT,
  OCEAN_PADDING_X,
  OCEAN_PADDING_Y,
  isoCells,
  darkenColor,
  topFaceVertices,
  cellToWorld,
  islandBoundingRect,
} from '@game/shared/iso';
import type GridSystem from '@game/systems/GridSystem';

const hexToInt = (hex: string): number => parseInt(hex.replace('#', ''), 16);

const OCEAN_TILE_COLOR = 0x1a3a6e;

const OCEAN_EXTRA_TILE_RADIUS = 8;
// WebGL гарантирует MAX_TEXTURE_SIZE ≥ 4096. При OCEAN_EXTRA_TILE_RADIUS=8 и сетке 20×16
// ширина фона = 4864 px → делим на чанки.
const MAX_TEXTURE_WIDTH = 4096;
const TILE_TEXTURE_KEY_PREFIX = '__tileGrid_';

interface ChunkLayout {
  bounds: { x: number; y: number; w: number; h: number };
  localOriginX: number;
  localOriginY: number;
  chunkCount: number;
}

class TileGrid {
  private sprites: Phaser.GameObjects.Image[] = [];
  private textureKeys: string[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly originX: number,
    private readonly originY: number,
  ) {}

  static prebake(scene: Phaser.Scene, grid: GridSystem, originX: number, originY: number): void {
    TileGrid.bakeChunks(scene, grid, TileGrid.computeChunkLayout(originX, originY, grid));
  }

  draw(grid: GridSystem): void {
    for (const s of this.sprites) s.destroy();
    this.sprites = [];
    for (const key of this.textureKeys) {
      if (this.scene.textures.exists(key)) this.scene.textures.remove(key);
    }
    this.textureKeys = [];

    const layout = TileGrid.computeChunkLayout(this.originX, this.originY, grid);
    const { bounds, chunkCount } = layout;

    for (let ci = 0; ci < chunkCount; ci++)
      this.textureKeys.push(`${TILE_TEXTURE_KEY_PREFIX}${ci}`);

    if (!this.scene.textures.exists(this.textureKeys[0])) {
      TileGrid.bakeChunks(this.scene, grid, layout);
    }

    for (let ci = 0; ci < chunkCount; ci++) {
      this.sprites.push(
        this.scene.add
          .image(bounds.x + ci * MAX_TEXTURE_WIDTH, bounds.y, this.textureKeys[ci])
          .setOrigin(0, 0),
      );
    }
  }

  private static computeChunkLayout(
    originX: number,
    originY: number,
    grid: GridSystem,
  ): ChunkLayout {
    const extCols = grid.cols + 2 * OCEAN_EXTRA_TILE_RADIUS;
    const extRows = grid.rows + 2 * OCEAN_EXTRA_TILE_RADIUS;
    const extOriginY = originY - 2 * OCEAN_EXTRA_TILE_RADIUS * ISO_TILE_HALF_HEIGHT;
    const bounds = islandBoundingRect(
      originX,
      extOriginY,
      extCols,
      extRows,
      OCEAN_PADDING_X,
      OCEAN_PADDING_Y,
    );
    return {
      bounds,
      localOriginX: originX - bounds.x,
      localOriginY: originY - bounds.y,
      chunkCount: Math.ceil(bounds.w / MAX_TEXTURE_WIDTH),
    };
  }

  private static bakeChunks(
    scene: Phaser.Scene,
    grid: GridSystem,
    { bounds, localOriginX, localOriginY, chunkCount }: ChunkLayout,
  ): void {
    const extCols = grid.cols + 2 * OCEAN_EXTRA_TILE_RADIUS;
    const extRows = grid.rows + 2 * OCEAN_EXTRA_TILE_RADIUS;

    for (let ci = 0; ci < chunkCount; ci++) {
      const chunkOffsetX = ci * MAX_TEXTURE_WIDTH;
      const chunkWidth = Math.min(MAX_TEXTURE_WIDTH, bounds.w - chunkOffsetX);

      const g = scene.add.graphics();
      g.fillStyle(OCEAN_TILE_COLOR, 1);
      g.fillRect(0, 0, chunkWidth, bounds.h);

      const drawTile = (tx: number, ty: number, color: number, strokeAlpha: number) => {
        const localX = tx - chunkOffsetX;
        if (localX + ISO_TILE_HALF_WIDTH < 0 || localX - ISO_TILE_HALF_WIDTH > chunkWidth) return;
        const pts = topFaceVertices(localX, ty, 1, 1);
        g.fillStyle(color, 1);
        g.fillPoints(pts, true);
        g.lineStyle(1, 0x000000, strokeAlpha);
        g.strokePoints(pts, true);
      };

      for (const { x: ex, y: ey } of isoCells(extCols, extRows)) {
        const cx = ex - OCEAN_EXTRA_TILE_RADIUS;
        const cy = ey - OCEAN_EXTRA_TILE_RADIUS;
        if (cx >= 0 && cx < grid.cols && cy >= 0 && cy < grid.rows) continue;
        const { x: tx, y: ty } = cellToWorld(cx, cy, localOriginX, localOriginY);
        drawTile(tx, ty, OCEAN_TILE_COLOR, 0.15);
      }

      for (const { x: cx, y: cy } of isoCells(grid.cols, grid.rows)) {
        const terrain = grid.terrainAt(cx, cy);
        if (!terrain) continue;
        const baseColor = terrain.land ? hexToInt(terrain.color) : OCEAN_TILE_COLOR;
        const tileColor =
          terrain.buildable && !grid.isUnlocked(cx, cy) ? darkenColor(baseColor, 0.5) : baseColor;
        const { x: tx, y: ty } = cellToWorld(cx, cy, localOriginX, localOriginY);
        drawTile(tx, ty, tileColor, 0.22);
      }

      g.generateTexture(`${TILE_TEXTURE_KEY_PREFIX}${ci}`, chunkWidth, bounds.h);
      g.destroy();
    }
  }
}

export default TileGrid;
