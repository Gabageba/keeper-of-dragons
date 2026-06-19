import Phaser from 'phaser';
import { CONTENT_MANIFEST } from './contentManifest';
import ContentLoader from '@game/systems/ContentLoader';
import TileGrid from '@game/objects/TileGrid';
import { calcIslandOrigin } from '@game/shared/iso';
import { GAME_CANVAS_WIDTH, GAME_CANVAS_HEIGHT } from '@game/shared/game';
import { REGISTRY_KEY_ISLAND_CALLBACKS, REGISTRY_KEY_ON_BOOT } from '@game/shared/registry';
import type { IslandCallbacks } from '@/types/bridge';
import emoteHeart from '@/assets/emotoins/emote_heart.png';
import emoteCash from '@/assets/emotoins/emote_cash.png';

class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    const cam = this.cameras.main;
    cam.setZoom(window.devicePixelRatio || 1);
    cam.centerOn(GAME_CANVAS_WIDTH / 2, GAME_CANVAS_HEIGHT / 2);
    this.createProgressBar();

    for (const { key, path, active } of CONTENT_MANIFEST) {
      if (active) this.load.json(key, path);
    }

    this.load.image('emote_heart', emoteHeart);
    this.load.image('emote_cash', emoteCash);
  }

  create(): void {
    ContentLoader.init(this);

    const onBoot = this.game.registry.get(REGISTRY_KEY_ON_BOOT) as (() => void) | undefined;
    onBoot?.();

    const callbacks = this.game.registry.get(REGISTRY_KEY_ISLAND_CALLBACKS) as
      | IslandCallbacks
      | undefined;
    const grid = callbacks?.getGrid();
    if (grid) {
      const { originX, originY } = calcIslandOrigin(grid.cols, grid.rows);
      TileGrid.prebake(this, grid, originX, originY);
    }

    this.scene.start('IslandScene');
  }

  private createProgressBar(): void {
    const cx = GAME_CANVAS_WIDTH / 2;
    const cy = GAME_CANVAS_HEIGHT / 2;

    const barBg = this.add.rectangle(cx, cy, 420, 28, 0x2e2845).setStrokeStyle(1, 0xc9a84c);
    const bar = this.add.rectangle(cx - 208, cy, 4, 20, 0xe8c97a).setOrigin(0, 0.5);
    const texts = [
      this.add
        .text(cx, cy - 44, 'Хранитель Драконов', {
          fontFamily: 'ElMessiri, serif',
          fontSize: '28px',
          color: '#c9a84c',
          resolution: window.devicePixelRatio,
        })
        .setOrigin(0.5),
      this.add
        .text(cx, cy - 16, 'Расти, корми, обнимай', {
          fontFamily: 'ElMessiri, serif',
          fontSize: '14px',
          color: '#8a7a9b',
          resolution: window.devicePixelRatio,
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
