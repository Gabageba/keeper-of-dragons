import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config';
import { DATA_MANIFEST } from '@/data/manifest';
import { ContentLoader } from '@/systems/ContentLoader';
import { GameState } from '@/systems/GameState';
import { SaveManager } from '@/systems/SaveManager';

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

    for (const { key, path, active } of DATA_MANIFEST) {
      if (active) this.load.json(key, path);
    }

    // TODO: загрузить спрайты острова, гнёзд, растений (task-27).
  }

  create(): void {
    ContentLoader.init(this);
    GameState.init(SaveManager.load() ?? SaveManager.createNew());

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
