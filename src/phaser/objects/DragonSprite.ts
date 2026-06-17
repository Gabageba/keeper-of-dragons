import type Phaser from 'phaser';
import { cellToWorld } from '@/systems/iso';
import { depthFor } from './BuildingSprite';
import type { DragonState } from '@/types';

/**
 * DragonSprite — каркас спрайта дракона на острове. Пока драконы не рисуются на
 * острове (нет гнёзд-объектов), это заготовка под анимации idle/tap/happy.
 * Тап вызывает onTap (колбэк → store.collectResource через IslandScene).
 */
class DragonSprite {
  readonly sprite: Phaser.GameObjects.Image;

  constructor(
    scene: Phaser.Scene,
    originX: number,
    originY: number,
    cellX: number,
    cellY: number,
    private readonly dragon: DragonState,
    onTap: (uid: string) => void,
  ) {
    const { x, y } = cellToWorld(cellX, cellY, originX, originY);
    this.sprite = scene.add
      .image(x, y, this.textureKey())
      .setDepth(depthFor(cellX, cellY))
      .setInteractive({ useHandCursor: true });
    this.sprite.on('pointerup', () => {
      this.playTap();
      onTap(this.dragon.uid);
    });
  }

  private textureKey(): string {
    return `dragon_${this.dragon.id}`;
  }

  /** idle-покачивание (каркас). */
  playIdle(): void {}

  /** реакция на тап — подпрыгивание (каркас). */
  playTap(): void {}

  /** «happy»-эмоция при кормлении (каркас). */
  playHappy(): void {}

  destroy(): void {
    this.sprite.destroy();
  }
}

export default DragonSprite;
