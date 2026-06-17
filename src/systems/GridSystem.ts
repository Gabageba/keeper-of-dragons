import type { Placement, TerrainDef } from '@/types';

/** Резолвер символа карты в тип клетки (обычно ContentLoader.terrainOf). */
type TerrainResolver = (char: string) => TerrainDef | undefined;

/**
 * GridSystem — логика сетки острова. Форма и типы клеток задаются текстовой
 * картой (массив строк); каждый символ резолвится в TerrainDef. Размер сетки
 * выводится из карты. Состояние открытости (расчищенные клетки) и занятости
 * постройками хранится отдельно.
 */
class GridSystem {
  readonly cols: number;
  readonly rows: number;
  private readonly map: string[];
  private readonly terrainOf: TerrainResolver;
  private readonly unlocked = new Set<string>(); // открытые для стройки клетки
  private readonly occupied = new Map<string, string>(); // "x,y" → uid
  constructor(map: string[], terrainOf: TerrainResolver, cleared: [number, number][] = []) {
    this.map = map;
    this.terrainOf = terrainOf;
    this.rows = map.length;
    this.cols = map.reduce((max, row) => Math.max(max, row.length), 0);

    // Клетки, открытые с самого начала (terrain.unlocked) + ранее расчищенные игроком.
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const t = this.terrainAt(x, y);
        if (t?.buildable && t.unlocked) this.unlocked.add(`${x},${y}`);
      }
    }
    for (const [x, y] of cleared) this.unlocked.add(`${x},${y}`);
  }

  /** Символ карты в клетке (вне карты / короткие строки → море). */
  private charAt(x: number, y: number): string {
    const row = this.map[y];
    return row && x >= 0 && x < row.length ? row[x] : '.';
  }

  /** Тип клетки (или undefined, если символ не описан в легенде). */
  terrainAt(x: number, y: number): TerrainDef | undefined {
    return this.terrainOf(this.charAt(x, y));
  }

  /** Рисуется ли клетка как суша (иначе — фон-море). */
  isLand(x: number, y: number): boolean {
    return this.terrainAt(x, y)?.land ?? false;
  }

  isUnlocked(x: number, y: number): boolean {
    return this.unlocked.has(`${x},${y}`);
  }

  /** Закрытая земля, которую можно расчистить за монеты (buildable, но ещё не открыта). */
  isClearable(x: number, y: number): boolean {
    return (this.terrainAt(x, y)?.buildable ?? false) && !this.unlocked.has(`${x},${y}`);
  }

  unlock(x: number, y: number): void {
    this.unlocked.add(`${x},${y}`);
  }

  /**
   * Возвращает true если прямоугольник w×h с верхним-левым углом (x,y) полностью
   * стоит на застраиваемых, открытых и незанятых клетках.
   * excludeUid — uid постройки, которую разрешено игнорировать (при перемещении).
   */
  canPlace(x: number, y: number, w: number, h: number, excludeUid?: string): boolean {
    for (let cy = y; cy < y + h; cy++) {
      for (let cx = x; cx < x + w; cx++) {
        if (cx < 0 || cx >= this.cols || cy < 0 || cy >= this.rows) return false;
        if (!this.terrainAt(cx, cy)?.buildable) return false;
        if (!this.unlocked.has(`${cx},${cy}`)) return false;
        const occ = this.occupied.get(`${cx},${cy}`);
        if (occ !== undefined && occ !== excludeUid) return false;
      }
    }
    return true;
  }

  place(p: Placement): void {
    for (let cy = p.y; cy < p.y + p.h; cy++) {
      for (let cx = p.x; cx < p.x + p.w; cx++) {
        this.occupied.set(`${cx},${cy}`, p.uid);
      }
    }
  }

  remove(uid: string): void {
    for (const [key, val] of this.occupied) {
      if (val === uid) this.occupied.delete(key);
    }
  }

  /** uid постройки, занимающей данную клетку, или undefined. */
  occupantAt(x: number, y: number): string | undefined {
    return this.occupied.get(`${x},${y}`);
  }

  /** Возвращает Set ключей "x,y" клеток из прямоугольника w×h, которые нельзя занять. */
  invalidCells(x: number, y: number, w: number, h: number, excludeUid?: string): Set<string> {
    const result = new Set<string>();
    for (let cy = y; cy < y + h; cy++) {
      for (let cx = x; cx < x + w; cx++) {
        if (cx < 0 || cx >= this.cols || cy < 0 || cy >= this.rows) {
          result.add(`${cx},${cy}`);
          continue;
        }
        if (!this.terrainAt(cx, cy)?.buildable) {
          result.add(`${cx},${cy}`);
          continue;
        }
        if (!this.unlocked.has(`${cx},${cy}`)) {
          result.add(`${cx},${cy}`);
          continue;
        }
        const occ = this.occupied.get(`${cx},${cy}`);
        if (occ !== undefined && occ !== excludeUid) result.add(`${cx},${cy}`);
      }
    }
    return result;
  }

  /**
   * BFS от (startX, startY): возвращает ближайшую клетку, куда можно поставить здание w×h.
   * Если стартовая клетка уже свободна — возвращает её.
   */
  nearestFreeCell(
    startX: number,
    startY: number,
    w: number,
    h: number,
    excludeUid?: string,
  ): { x: number; y: number } | null {
    if (this.canPlace(startX, startY, w, h, excludeUid)) return { x: startX, y: startY };

    const visited = new Set<string>();
    visited.add(`${startX},${startY}`);
    const queue: [number, number][] = [[startX, startY]];

    while (queue.length > 0) {
      const [cx, cy] = queue.shift()!;
      for (const [dx, dy] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ] as [number, number][]) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < 0 || ny < 0 || nx + w > this.cols || ny + h > this.rows) continue;
        const key = `${nx},${ny}`;
        if (visited.has(key)) continue;
        visited.add(key);
        if (this.canPlace(nx, ny, w, h, excludeUid)) return { x: nx, y: ny };
        queue.push([nx, ny]);
      }
    }
    return null;
  }
}

export default GridSystem;
