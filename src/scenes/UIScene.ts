import Phaser from 'phaser';
import { GAME_WIDTH } from '@/config';

/**
 * UIScene — постоянный оверлей поверх игры: валюты, уровень Хранителя,
 * кнопки меню (Книга, Рынок, Скрещивание). Всегда сверху.
 * См. GDD «Архитектура сцен Phaser».
 */
export class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  create(): void {
    // Верхняя панель-заглушка с валютами.
    this.add.rectangle(0, 0, GAME_WIDTH, 56, 0x13101e, 0.9).setOrigin(0, 0);
    this.add.text(20, 18, '🪙 0    💎 0    ✨ Ур. 1', {
      fontFamily: 'serif',
      fontSize: '20px',
      color: '#d4cce8',
    });
    // TODO: реактивное обновление из стора (см. task-03 / task-16).
  }
}
