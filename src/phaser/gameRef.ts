import type Phaser from 'phaser';
import type IslandScene from './scenes/IslandScene';

// Ссылка на текущий Phaser.Game. Устанавливается в PhaserGame.tsx; читается
// мостом и usePhaserBridge для команд React → Phaser.
let game: Phaser.Game | null = null;

export const setGame = (g: Phaser.Game | null): void => {
  game = g;
};

export const getGame = (): Phaser.Game | null => {
  return game;
};

export const getIslandScene = (): IslandScene | null => {
  const scene = game?.scene.getScene('IslandScene') as IslandScene | undefined;
  return scene ?? null;
};
