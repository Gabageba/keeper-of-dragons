import { GAME_CANVAS_WIDTH, GAME_CANVAS_HEIGHT } from '@game/shared/game';
import Phaser from 'phaser';

class MapScene extends Phaser.Scene {
  constructor() {
    super('MapScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#0d0b14');

    this.add
      .text(GAME_CANVAS_WIDTH / 2, GAME_CANVAS_HEIGHT / 2 - 40, 'Карта Архипелага', {
        fontFamily: 'ElMessiri, serif',
        fontSize: '48px',
        color: '#d4cce8',
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_CANVAS_WIDTH / 2, GAME_CANVAS_HEIGHT / 2 + 16, '(task-17)', {
        fontFamily: 'ElMessiri, serif',
        fontSize: '22px',
        color: '#9a8ab8',
      })
      .setOrigin(0.5);

    const backButton = this.add
      .text(GAME_CANVAS_WIDTH / 2, GAME_CANVAS_HEIGHT / 2 + 90, '← На остров', {
        fontFamily: 'ElMessiri, serif',
        fontSize: '28px',
        color: '#c9a84c',
        backgroundColor: '#1e1a2e',
        padding: { x: 24, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    backButton.on('pointerup', () => {
      this.scene.stop('MapScene');
      this.scene.wake('IslandScene');
    });
  }
}

export default MapScene;
