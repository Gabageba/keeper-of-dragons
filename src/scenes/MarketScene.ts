import { ModalScene } from './ModalScene';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config';

/** Рынок (Заказы Совета) — заглушка. Реализация в task-14. */
export class MarketScene extends ModalScene {
  constructor() {
    super('MarketScene');
  }

  create(): void {
    super.create();
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Рынок\n(task-14)', {
        fontFamily: 'serif',
        fontSize: '36px',
        color: '#d4cce8',
        align: 'center',
      })
      .setOrigin(0.5);
  }
}
