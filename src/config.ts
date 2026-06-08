import Phaser from 'phaser';
import { BootScene } from '@/scenes/BootScene';
import { PreloadScene } from '@/scenes/PreloadScene';
import { IslandScene } from '@/scenes/IslandScene';
import { UIScene } from '@/scenes/UIScene';

/** Размер одной клетки сетки острова в пикселях (см. GDD «Сетка острова»). */
export const TILE_SIZE = 64;

/** Базовое логическое разрешение. Масштабируется под экран через Scale.FIT. */
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0d0b14',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  render: {
    pixelArt: false,
    antialias: true,
  },
  // Порядок важен: BootScene стартует первой.
  scene: [BootScene, PreloadScene, IslandScene, UIScene],
};
