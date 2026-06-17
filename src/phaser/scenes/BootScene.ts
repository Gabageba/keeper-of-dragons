import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config';
import { DATA_MANIFEST } from '@/data/manifest';
import ContentLoader from '@/systems/ContentLoader';
import { islandOrigin } from '@/systems/iso';
import TileGrid from '../objects/TileGrid';
import { type IslandCallbacks, REGISTRY_CALLBACKS, REGISTRY_ON_BOOT } from '../bridge/types';

/**
 * BootScene — прогресс-бар, загрузка JSON-контента и спрайтов острова. По
 * завершении инициализирует контент-слой, дёргает onBoot (мост: инициализация
 * стора + оффлайн-прогресс) и стартует IslandScene. Стор сцена не импортирует.
 */
class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
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

    const onBoot = this.game.registry.get(REGISTRY_ON_BOOT) as (() => void) | undefined;
    onBoot?.();

    // Запекаем тайловый фон пока загрузочный экран ещё виден.
    const cb = this.game.registry.get(REGISTRY_CALLBACKS) as IslandCallbacks | undefined;
    const grid = cb?.getGrid();
    if (grid) {
      const { originX, originY } = islandOrigin(grid.cols, grid.rows);
      TileGrid.prebake(this, grid, originX, originY);
    }

    this.scene.start('IslandScene');
  }

  private createProgressBar(): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const barBg = this.add.rectangle(cx, cy, 420, 28, 0x2e2845).setStrokeStyle(1, 0xc9a84c);
    const bar = this.add.rectangle(cx - 208, cy, 4, 20, 0xe8c97a).setOrigin(0, 0.5);
    const texts = [
      this.add
        .text(cx, cy - 44, 'Хранитель Драконов', {
          fontFamily: 'ElMessiri, serif',
          fontSize: '28px',
          color: '#c9a84c',
        })
        .setOrigin(0.5),
      this.add
        .text(cx, cy - 16, 'Расти, корми, обнимай', {
          fontFamily: 'ElMessiri, serif',
          fontSize: '14px',
          color: '#8a7a9b',
        })
        .setOrigin(0.5),
    ];

    this.load.on('progress', (value: number) => {
      bar.width = 4 + 412 * value;
    });
    this.load.on('complete', () => {
      barBg.destroy();
      bar.destroy();
      texts.forEach((t) => t.destroy());
    });
  }
}

export default BootScene;
