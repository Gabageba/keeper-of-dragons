import Phaser from 'phaser';
import { CONTENT_MANIFEST } from './contentManifest';
import ContentLoader from '@game/systems/ContentLoader';
import TileGrid from '@game/objects/TileGrid';
import { calcIslandOrigin } from '@game/shared/iso';
import { GAME_CANVAS_WIDTH, GAME_CANVAS_HEIGHT } from '@game/shared/game';
import { REGISTRY_KEY_ISLAND_CALLBACKS, REGISTRY_KEY_ON_BOOT } from '@game/shared/registry';
import type { IslandCallbacks } from '@/types/bridge';
import { useUIStore } from '@store/useUIStore';
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

    this.load.on('progress', (v: number) => useUIStore.getState().setLoadingProgress(v));

    for (const { key, path, active } of CONTENT_MANIFEST) {
      if (active) this.load.json(key, path);
    }

    this.load.image('emote_heart', emoteHeart);
    this.load.image('emote_cash', emoteCash);
  }

  create(): void {
    ContentLoader.init(this);

    const callbacks = this.game.registry.get(REGISTRY_KEY_ISLAND_CALLBACKS) as
      | IslandCallbacks
      | undefined;
    const grid = callbacks?.getGrid();
    if (grid) {
      const { originX, originY } = calcIslandOrigin(grid.cols, grid.rows);
      TileGrid.prebake(this, grid, originX, originY);
    }

    Promise.allSettled([
      document.fonts.load('700 1em "Balsamiq Sans"'),
      document.fonts.load('700 1em "Nunito"'),
    ]).then(() => {
      const onBoot = this.game.registry.get(REGISTRY_KEY_ON_BOOT) as (() => void) | undefined;
      onBoot?.();
      this.scene.start('IslandScene');
    });
  }
}

export default BootScene;
