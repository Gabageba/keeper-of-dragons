import type Phaser from 'phaser';
import { GAME_CANVAS_WIDTH, GAME_CANVAS_HEIGHT } from './game';
import type { IslandPoint } from '@/types/island';

// ─── Константы изометрической сетки ─────────────────────────────────────────

export const ISO_TILE_SIZE = 64;

/** Половина ширины ромба-тайла в пикселях. */
export const ISO_TILE_HALF_WIDTH = ISO_TILE_SIZE; // 64 px

/** Половина высоты ромба-тайла в пикселях. */
export const ISO_TILE_HALF_HEIGHT = ISO_TILE_SIZE / 2; // 32 px

/** Визуальная высота здания от подошвы до крыши в пикселях. */
export const ISO_BUILDING_HEIGHT = 28;

/** Количество тайлов океанской рамки вокруг острова. */
export const OCEAN_BORDER_TILES = 2;

export const OCEAN_PADDING_X = 2 * OCEAN_BORDER_TILES * ISO_TILE_HALF_WIDTH;
export const OCEAN_PADDING_Y = 2 * OCEAN_BORDER_TILES * ISO_TILE_HALF_HEIGHT;

// ─── Координатные преобразования ─────────────────────────────────────────────

/**
 * Мировые пиксельные координаты → координаты клетки изо-сетки.
 * origin — северная вершина ромба клетки (0,0) в пикселях.
 */
export const worldToCell = (
  worldX: number,
  worldY: number,
  originX: number,
  originY: number,
): IslandPoint => {
  const relX = worldX - originX;
  const relY = worldY - originY;
  return {
    x: Math.floor((relX / ISO_TILE_HALF_WIDTH + relY / ISO_TILE_HALF_HEIGHT) / 2),
    y: Math.floor((relY / ISO_TILE_HALF_HEIGHT - relX / ISO_TILE_HALF_WIDTH) / 2),
  };
};

/** Координаты клетки → мировые координаты северной вершины её ромба. */
export const cellToWorld = (
  cellX: number,
  cellY: number,
  originX: number,
  originY: number,
): IslandPoint => ({
  x: originX + (cellX - cellY) * ISO_TILE_HALF_WIDTH,
  y: originY + (cellX + cellY) * ISO_TILE_HALF_HEIGHT,
});

/**
 * Четыре вершины верхней грани (ромба) прямоугольника w×h с северной вершиной
 * в мировой точке (wx, wy), приподнятого на `lift` пикселей.
 * Порядок: север, восток, юг, запад.
 */
export const topFaceVertices = (
  wx: number,
  wy: number,
  w: number,
  h: number,
  lift = 0,
): IslandPoint[] => [
  { x: wx, y: wy - lift },
  { x: wx + w * ISO_TILE_HALF_WIDTH, y: wy + w * ISO_TILE_HALF_HEIGHT - lift },
  { x: wx + (w - h) * ISO_TILE_HALF_WIDTH, y: wy + (w + h) * ISO_TILE_HALF_HEIGHT - lift },
  { x: wx - h * ISO_TILE_HALF_WIDTH, y: wy + h * ISO_TILE_HALF_HEIGHT - lift },
];

/** Мировое начало изо-карты: северная вершина ромба клетки (0,0). */
export const calcIslandOrigin = (
  cols: number,
  rows: number,
): { originX: number; originY: number } => ({
  originX: Math.floor(GAME_CANVAS_WIDTH / 2),
  originY: Math.max(
    ISO_BUILDING_HEIGHT + 16,
    Math.floor((GAME_CANVAS_HEIGHT - (cols + rows) * ISO_TILE_HALF_HEIGHT) / 2),
  ),
});

/** AABB острова cols×rows в мировых координатах, расширенный отступами padX/padY. */
export const islandBoundingRect = (
  originX: number,
  originY: number,
  cols: number,
  rows: number,
  padX: number,
  padY: number,
): { x: number; y: number; w: number; h: number } => ({
  x: originX - rows * ISO_TILE_HALF_WIDTH - padX,
  y: originY - ISO_BUILDING_HEIGHT - padY,
  w: (cols + rows) * ISO_TILE_HALF_WIDTH + padX * 2,
  h: (cols + rows) * ISO_TILE_HALF_HEIGHT + ISO_BUILDING_HEIGHT + padY * 2,
});

// ─── Рендер-хелперы ───────────────────────────────────────────────────────────

/** Затемняет цвет 0xRRGGBB, умножая каждый канал на factor. */
export const darkenColor = (color: number, factor: number): number => {
  const r = Math.floor(((color >> 16) & 0xff) * factor);
  const g = Math.floor(((color >> 8) & 0xff) * factor);
  const b = Math.floor((color & 0xff) * factor);
  return (r << 16) | (g << 8) | b;
};

/**
 * Перебирает клетки прямоугольника w×h в изометрическом порядке отрисовки
 * (по диагоналям, сзади-наперёд), чтобы тайлы накладывались корректно.
 */
export function* isoCells(w: number, h: number): Generator<{ x: number; y: number }> {
  for (let sum = 0; sum < w + h - 1; sum++) {
    for (let x = 0; x <= sum; x++) {
      const y = sum - x;
      if (x < w && y < h) yield { x, y };
    }
  }
}

/** Рисует изометрическую «коробку» здания w×h с северной вершиной в (wx, wy). */
export const drawIsoBox = (
  graphics: Phaser.GameObjects.Graphics,
  wx: number,
  wy: number,
  w: number,
  h: number,
  color: number,
  alpha: number,
): void => {
  const [, E, S, W] = topFaceVertices(wx, wy, w, h);
  const roof = topFaceVertices(wx, wy, w, h, ISO_BUILDING_HEIGHT);

  graphics.fillStyle(darkenColor(color, 0.6), alpha);
  graphics.fillPoints([E, S, roof[2], roof[1]], true);

  graphics.fillStyle(darkenColor(color, 0.42), alpha);
  graphics.fillPoints([W, S, roof[2], roof[3]], true);

  graphics.fillStyle(color, alpha);
  graphics.fillPoints(roof, true);
  graphics.lineStyle(1, 0x000000, 0.3);
  graphics.strokePoints(roof, true);
};
