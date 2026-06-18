import type Phaser from 'phaser';
import type { DragonState } from '@/types/dragon';
import { cellToWorld } from '@game/shared/iso';
import { calcBuildingDepth } from '../shared/building';

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
      .image(x, y, `dragon_${this.dragon.id}`)
      .setDepth(calcBuildingDepth(cellX, cellY))
      .setInteractive({ useHandCursor: true });
    this.sprite.on('pointerup', () => {
      this.playTap();
      onTap(this.dragon.uid);
    });
  }

  playIdle(): void {}
  playTap(): void {}
  playHappy(): void {}

  destroy(): void {
    this.sprite.destroy();
  }
}

export default DragonSprite;
