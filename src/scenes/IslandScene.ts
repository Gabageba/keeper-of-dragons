import Phaser from 'phaser';
import { TILE_SIZE } from '@/config';

/**
 * IslandScene — главная игровая сцена: остров с сеткой, гнёздами, садами,
 * тапами по драконам. На старте показывает заглушку-сетку 14×11
 * (Пепельный остров, см. GDD «Сетка острова»).
 */
export class IslandScene extends Phaser.Scene {
  private readonly cols = 14;
  private readonly rows = 11;

  constructor() {
    super('IslandScene');
  }

  create(): void {
    this.drawGridPlaceholder();

    this.add
      .text(16, 16, 'IslandScene — заглушка\nСм. docs/tasks/05-island-grid-placement.md', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#7a6f99',
      })
      .setScrollFactor(0);
  }

  /** Временная отрисовка сетки острова, пока нет тайлмапа и ассетов. */
  private drawGridPlaceholder(): void {
    const offsetX = 240;
    const offsetY = 120;
    const g = this.add.graphics();
    g.lineStyle(1, 0x2e2845, 0.8);
    for (let x = 0; x <= this.cols; x++) {
      g.lineBetween(offsetX + x * TILE_SIZE, offsetY, offsetX + x * TILE_SIZE, offsetY + this.rows * TILE_SIZE);
    }
    for (let y = 0; y <= this.rows; y++) {
      g.lineBetween(offsetX, offsetY + y * TILE_SIZE, offsetX + this.cols * TILE_SIZE, offsetY + y * TILE_SIZE);
    }
  }
}
