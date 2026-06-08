import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config';
import { Navigation } from '@/systems/Navigation';

/** Карта архипелага — заглушка. Реализация в task-17. */
export class MapScene extends Phaser.Scene {
  constructor() {
    super('MapScene');
  }

  create(): void {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0d0b14).setOrigin(0, 0);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'Карта Архипелага\n(task-17)', {
        fontFamily: 'serif',
        fontSize: '36px',
        color: '#d4cce8',
        align: 'center',
      })
      .setOrigin(0.5);

    const backBtn = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, '← На остров', {
        fontFamily: 'serif',
        fontSize: '22px',
        color: '#c9a84c',
        backgroundColor: '#1e1a2e',
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ cursor: 'pointer' });

    backBtn.on('pointerup', () => Navigation.gotoIsland('ash'));
    backBtn.on('pointerover', () => backBtn.setAlpha(0.7));
    backBtn.on('pointerout', () => backBtn.setAlpha(1));
  }
}
