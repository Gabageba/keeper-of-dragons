import Phaser from 'phaser';

/**
 * BootScene — самая первая сцена. Загружает минимум, нужный для экрана
 * загрузки (шрифт, фон прогресс-бара), затем передаёт управление PreloadScene.
 * См. GDD «Архитектура сцен Phaser».
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    // TODO: загрузить ассеты прогресс-бара (см. task-02 / task-27).
  }

  create(): void {
    this.scene.start('PreloadScene');
  }
}
