import Phaser from 'phaser';
import { TILE_SIZE, GAME_WIDTH, GAME_HEIGHT } from '@/config';
import type { OfflineSummary } from '@/types';

export class IslandScene extends Phaser.Scene {
  private readonly cols = 14;
  private readonly rows = 11;
  private pendingOfflineSummary: OfflineSummary | null = null;

  constructor() {
    super('IslandScene');
  }

  // islandId будет использован в task-17 (выбор острова на карте)
  init(data: { islandId?: string; offlineSummary?: OfflineSummary }): void {
    this.pendingOfflineSummary = data?.offlineSummary ?? null;
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

    if (this.pendingOfflineSummary) {
      this.showOfflineSummary(this.pendingOfflineSummary);
      this.pendingOfflineSummary = null;
    }

  }

  private showOfflineSummary(summary: OfflineSummary): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const hours = Math.floor(summary.elapsed_ms / 3_600_000);
    const minutes = Math.floor((summary.elapsed_ms % 3_600_000) / 60_000);
    const timeStr = hours > 0 ? `${hours} ч ${minutes} мин` : `${minutes} мин`;

    const lines: string[] = [`Пока вас не было: ${timeStr}`, ''];

    for (const [resource, amount] of Object.entries(summary.resources_gained)) {
      if (amount > 0) lines.push(`+ ${amount}  ${resource}`);
    }
    if (summary.breeding_completed) lines.push('Скрещивание завершено!');
    if (summary.eggs_hatched > 0) lines.push(`Вылупилось яиц: ${summary.eggs_hatched}`);

    lines.push('', 'Нажмите, чтобы продолжить');

    const panelH = Math.max(180, lines.length * 30 + 48);

    const overlay = this.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.65)
      .setOrigin(0, 0)
      .setDepth(50)
      .setInteractive();

    const panel = this.add
      .rectangle(cx, cy, 460, panelH, 0x1e1a2e)
      .setDepth(51)
      .setStrokeStyle(1, 0xc9a84c)
      .setInteractive();

    const text = this.add
      .text(cx, cy, lines.join('\n'), {
        fontFamily: 'serif',
        fontSize: '20px',
        color: '#d4cce8',
        align: 'center',
        lineSpacing: 6,
      })
      .setOrigin(0.5)
      .setDepth(52);

    const close = (): void => {
      overlay.destroy();
      panel.destroy();
      text.destroy();
    };

    overlay.on('pointerup', close);
    panel.on('pointerup', close);
  }

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
