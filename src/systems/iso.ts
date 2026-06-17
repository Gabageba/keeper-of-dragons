import type Phaser from 'phaser';
import { ISO_HALF_W, ISO_HALF_H, ISO_BLDG_H, GAME_WIDTH, GAME_HEIGHT } from '@/config';

export interface Point {
  x: number;
  y: number;
}

/** Парсит цвет "#rrggbb" (или "rrggbb") в число 0xRRGGBB. */
export const hexToInt = (hex: string): number => {
  return parseInt(hex.replace('#', ''), 16);
};

/**
 * Мировые координаты (пиксели) → координаты клетки изометрической сетки.
 * origin — вершина ромба клетки (0,0) в пикселях. Чистая функция (без состояния сетки).
 */
export const worldToCell = (
  worldX: number,
  worldY: number,
  originX: number,
  originY: number,
): Point => {
  const relX = worldX - originX;
  const relY = worldY - originY;
  return {
    x: Math.floor((relX / ISO_HALF_W + relY / ISO_HALF_H) / 2),
    y: Math.floor((relY / ISO_HALF_H - relX / ISO_HALF_W) / 2),
  };
};

/** Координаты клетки → мировые координаты верхней (северной) вершины ромба. */
export const cellToWorld = (cx: number, cy: number, originX: number, originY: number): Point => {
  return {
    x: originX + (cx - cy) * ISO_HALF_W,
    y: originY + (cx + cy) * ISO_HALF_H,
  };
};

/** Мировое начало изометрической карты: северная вершина ромба клетки (0,0). */
export const islandOrigin = (cols: number, rows: number): { originX: number; originY: number } => ({
  originX: Math.floor(GAME_WIDTH / 2),
  originY: Math.max(ISO_BLDG_H + 16, Math.floor((GAME_HEIGHT - (cols + rows) * ISO_HALF_H) / 2)),
});

/** Прямоугольник острова cols×rows (в мировых координатах), расширенный отступом pad. */
export const islandRect = (
  originX: number,
  originY: number,
  cols: number,
  rows: number,
  padX: number,
  padY: number,
): { x: number; y: number; w: number; h: number } => {
  return {
    x: originX - rows * ISO_HALF_W - padX,
    y: originY - ISO_BLDG_H - padY,
    w: (cols + rows) * ISO_HALF_W + padX * 2,
    h: (cols + rows) * ISO_HALF_H + ISO_BLDG_H + padY * 2,
  };
};

/** Затемняет цвет 0xRRGGBB, умножая каждый канал на factor. */
export const darken = (color: number, factor: number): number => {
  const r = Math.floor(((color >> 16) & 0xff) * factor);
  const g = Math.floor(((color >> 8) & 0xff) * factor);
  const b = Math.floor((color & 0xff) * factor);
  return (r << 16) | (g << 8) | b;
};

/**
 * Четыре вершины верхней грани (ромба) прямоугольника w×h, северная вершина
 * которого — мировая точка (wx, wy), приподнятого на `lift` пикселей.
 * Порядок вершин: север, восток, юг, запад. Тайл земли — это topFace(...,1,1).
 */
export const topFace = (wx: number, wy: number, w: number, h: number, lift = 0): Point[] => {
  return [
    { x: wx, y: wy - lift },
    { x: wx + w * ISO_HALF_W, y: wy + w * ISO_HALF_H - lift },
    { x: wx + (w - h) * ISO_HALF_W, y: wy + (w + h) * ISO_HALF_H - lift },
    { x: wx - h * ISO_HALF_W, y: wy + h * ISO_HALF_H - lift },
  ];
};

/**
 * Перебирает клетки прямоугольника w×h в порядке отрисовки изометрии
 * (по диагоналям, сзади-наперёд), чтобы тайлы/коробки накладывались корректно.
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
  g: Phaser.GameObjects.Graphics,
  wx: number,
  wy: number,
  w: number,
  h: number,
  color: number,
  alpha: number,
): void => {
  const [, E, S, W] = topFace(wx, wy, w, h);
  const roof = topFace(wx, wy, w, h, ISO_BLDG_H);

  // Правая стена (восток → юг)
  g.fillStyle(darken(color, 0.6), alpha);
  g.fillPoints([E, S, roof[2], roof[1]], true);

  // Левая стена (запад → юг)
  g.fillStyle(darken(color, 0.42), alpha);
  g.fillPoints([W, S, roof[2], roof[3]], true);

  // Крыша
  g.fillStyle(color, alpha);
  g.fillPoints(roof, true);
  g.lineStyle(1, 0x000000, 0.3);
  g.strokePoints(roof, true);
};
