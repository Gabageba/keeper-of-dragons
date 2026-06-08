import { ModalScene } from './ModalScene';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config';

/** Сцена скрещивания — заглушка. Реализация в task-11. */
export class BreedingScene extends ModalScene {
  constructor() {
    super('BreedingScene');
  }

  create(): void {
    super.create();
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Скрещивание\n(task-11)', {
        fontFamily: 'serif',
        fontSize: '36px',
        color: '#d4cce8',
        align: 'center',
      })
      .setOrigin(0.5);
  }
}
