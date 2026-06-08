import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config';

/**
 * PreloadScene — показывает прогресс-бар и грузит JSON-контент и спрайты
 * острова. По завершении стартует IslandScene + UIScene поверх неё.
 * См. GDD «Архитектура сцен Phaser».
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    this.createProgressBar();

    // TODO: загрузить JSON-контент (см. task-02-data-content-layer.md)
    // this.load.json('dragons', 'data/dragons.json');
    // this.load.json('plants', 'data/plants.json');
    // this.load.json('breeding', 'data/breeding.json');

    // TODO: загрузить спрайты острова, гнёзд, растений (task-27).
  }

  create(): void {
    this.scene.start('IslandScene');
    this.scene.launch('UIScene');
  }

  private createProgressBar(): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const barBg = this.add.rectangle(cx, cy, 420, 28, 0x2e2845).setStrokeStyle(1, 0xc9a84c);
    const bar = this.add.rectangle(cx - 208, cy, 4, 20, 0xe8c97a).setOrigin(0, 0.5);
    const label = this.add
      .text(cx, cy - 44, 'Архипелаг Драконов', { fontFamily: 'serif', fontSize: '28px', color: '#c9a84c' })
      .setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      bar.width = 4 + 412 * value;
    });
    this.load.on('complete', () => {
      barBg.destroy();
      bar.destroy();
      label.destroy();
    });
  }
}
