import { ModalScene } from './ModalScene';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config';

/** Книга Драконов — заглушка. Реализация в task-13. */
export class BookScene extends ModalScene {
  constructor() {
    super('BookScene');
  }

  create(): void {
    super.create();
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Книга Драконов\n(task-13)', {
        fontFamily: 'serif',
        fontSize: '36px',
        color: '#d4cce8',
        align: 'center',
      })
      .setOrigin(0.5);
  }
}
