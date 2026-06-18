import type Phaser from 'phaser';
import type IslandScene from './scenes/IslandScene';

let activeGame: Phaser.Game | null = null;

export const setGame = (game: Phaser.Game | null): void => {
  activeGame = game;
};

export const getGame = (): Phaser.Game | null => activeGame;

export const getIslandScene = (): IslandScene | null => {
  const scene = activeGame?.scene.getScene('IslandScene') as IslandScene | undefined;
  return scene ?? null;
};
