import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config';

/**
 * Базовый класс для модальных сцен (Книга, Рынок, Скрещивание).
 * Рисует затемнённый фон, добавляет кнопку закрытия, блокирует тапы
 * на нижней сцене и ставит IslandScene на паузу.
 */
export abstract class ModalScene extends Phaser.Scene {
  protected create(): void {
    // Полноэкранный оверлей — клик снаружи панели закрывает модалку
    this.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.65)
      .setOrigin(0, 0)
      .setInteractive()
      .on('pointerup', () => this.close());

    // Панель модалки — блокирует клики, не давая им дойти до оверлея
    this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 80, GAME_HEIGHT - 120, 0x1e1a2e)
      .setOrigin(0.5)
      .setInteractive();

    // Кнопка закрытия — ниже топ-бара UIScene (y=56)
    const closeBtn = this.add
      .text(GAME_WIDTH - 60, 72, '✕', {
        fontFamily: 'serif',
        fontSize: '30px',
        color: '#c9a84c',
      })
      .setOrigin(1, 0.5)
      .setInteractive({ cursor: 'pointer' });

    closeBtn.on('pointerup', () => this.close());
    closeBtn.on('pointerover', () => closeBtn.setAlpha(0.65));
    closeBtn.on('pointerout', () => closeBtn.setAlpha(1));

    // Пауза острова только если он запущен (не паузе от другой модалки)
    if (this.scene.isActive('IslandScene')) {
      this.scene.pause('IslandScene');
    }
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.scene.isPaused('IslandScene')) {
        this.scene.resume('IslandScene');
      }
    });
  }

  close(): void {
    this.scene.stop();
  }
}
