import type { Placement, TerrainDef } from '@/types/island';

type TerrainResolver = (char: string) => TerrainDef | undefined;

class GridSystem {
  readonly cols: number;
  readonly rows: number;
  private readonly map: string[];
  private readonly terrainOf: TerrainResolver;
  private readonly unlockedCells = new Set<string>();
  private readonly occupiedCells = new Map<string, string>(); // "x,y" → uid

  constructor(map: string[], terrainOf: TerrainResolver, clearedCells: [number, number][] = []) {
    this.map = map;
    this.terrainOf = terrainOf;
    this.rows = map.length;
    this.cols = map.reduce((max, row) => Math.max(max, row.length), 0);

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const t = this.terrainAt(x, y);
        if (t?.buildable && t.unlocked) this.unlockedCells.add(`${x},${y}`);
      }
    }
    for (const [x, y] of clearedCells) this.unlockedCells.add(`${x},${y}`);
  }

  private charAt(x: number, y: number): string {
    const row = this.map[y];
    return row && x >= 0 && x < row.length ? row[x] : '.';
  }

  terrainAt(x: number, y: number): TerrainDef | undefined {
    return this.terrainOf(this.charAt(x, y));
  }

  isLand(x: number, y: number): boolean {
    return this.terrainAt(x, y)?.land ?? false;
  }

  isUnlocked(x: number, y: number): boolean {
    return this.unlockedCells.has(`${x},${y}`);
  }

  isClearable(x: number, y: number): boolean {
    return (this.terrainAt(x, y)?.buildable ?? false) && !this.unlockedCells.has(`${x},${y}`);
  }

  unlock(x: number, y: number): void {
    this.unlockedCells.add(`${x},${y}`);
  }

  canPlace(x: number, y: number, w: number, h: number, excludeUid?: string): boolean {
    for (let cy = y; cy < y + h; cy++) {
      for (let cx = x; cx < x + w; cx++) {
        if (cx < 0 || cx >= this.cols || cy < 0 || cy >= this.rows) return false;
        if (!this.terrainAt(cx, cy)?.buildable) return false;
        if (!this.unlockedCells.has(`${cx},${cy}`)) return false;
        const occupant = this.occupiedCells.get(`${cx},${cy}`);
        if (occupant !== undefined && occupant !== excludeUid) return false;
      }
    }
    return true;
  }

  place(p: Placement): void {
    for (let cy = p.y; cy < p.y + p.h; cy++) {
      for (let cx = p.x; cx < p.x + p.w; cx++) {
        this.occupiedCells.set(`${cx},${cy}`, p.uid);
      }
    }
  }

  remove(uid: string): void {
    for (const [key, val] of this.occupiedCells) {
      if (val === uid) this.occupiedCells.delete(key);
    }
  }

  occupantAt(x: number, y: number): string | undefined {
    return this.occupiedCells.get(`${x},${y}`);
  }

  invalidCells(x: number, y: number, w: number, h: number, excludeUid?: string): Set<string> {
    const result = new Set<string>();
    for (let cy = y; cy < y + h; cy++) {
      for (let cx = x; cx < x + w; cx++) {
        if (cx < 0 || cx >= this.cols || cy < 0 || cy >= this.rows) {
          result.add(`${cx},${cy}`);
          continue;
        }
        if (!this.terrainAt(cx, cy)?.buildable) { result.add(`${cx},${cy}`); continue; }
        if (!this.unlockedCells.has(`${cx},${cy}`)) { result.add(`${cx},${cy}`); continue; }
        const occupant = this.occupiedCells.get(`${cx},${cy}`);
        if (occupant !== undefined && occupant !== excludeUid) result.add(`${cx},${cy}`);
      }
    }
    return result;
  }

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
        [-1, 0], [1, 0], [0, -1], [0, 1],
        [-1, -1], [-1, 1], [1, -1], [1, 1],
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
