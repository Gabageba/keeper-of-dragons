import type Phaser from 'phaser';
import type { DragonState } from '@/types/dragon';
import { CURRENT_RENDER_MODE, RENDER_MODE } from '@/consts/renderMode';
import { placeholderDragonColor } from '@game/shared/placeholderArt';
import ContentLoader from '@game/systems/ContentLoader';

class DragonSprite {
  private readonly visual: Phaser.GameObjects.Image | Phaser.GameObjects.Arc;
  private readonly scene: Phaser.Scene;
  private readonly baseY: number;
  private idleTween: Phaser.Tweens.Tween | null = null;
  private isAnimating = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    depth: number,
    private readonly dragon: DragonState,
    onTap?: (uid: string) => void,
  ) {
    this.scene = scene;
    this.baseY = y;

    if (CURRENT_RENDER_MODE === RENDER_MODE.TEXTURED) {
      this.visual = scene.add.image(x, y, `dragon_${this.dragon.id}`).setDepth(depth);
    } else {
      this.visual = scene.add
        .arc(
          x,
          y,
          14,
          0,
          360,
          false,
          placeholderDragonColor(ContentLoader.dragon(dragon.id)?.element),
        )
        .setDepth(depth);
    }

    if (onTap) {
      this.visual.setInteractive({ useHandCursor: true }).on('pointerup', () => {
        onTap(this.dragon.uid);
      });
    }

    this.playIdle();
  }

  playIdle(): void {
    if (this.idleTween) return;
    this.idleTween = this.scene.tweens.add({
      targets: this.visual,
      y: this.baseY - 4,
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  playCollect(): void {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.idleTween?.stop();
    this.idleTween = null;
    this.scene.tweens.add({
      targets: this.visual,
      y: this.baseY - 24,
      scaleX: 1.12,
      scaleY: 1.12,
      duration: 140,
      ease: 'Quad.easeOut',
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        this.visual.setScale(1);
        this.isAnimating = false;
        this.playIdle();
      },
    });
    this.showEmotion('emote_heart');
  }

  private showEmotion(key: string): void {
    const img = this.scene.add
      .image(this.visual.x, this.visual.y - 28, key)
      .setDepth(this.visual.depth + 1)
      .setScale(1.5)
      .setOrigin(0.5);
    this.scene.tweens.add({
      targets: img,
      y: '-=36',
      alpha: 0,
      duration: 800,
      ease: 'Quad.easeOut',
      onComplete: () => img.destroy(),
    });
  }

  destroy(): void {
    this.idleTween?.stop();
    this.visual.destroy();
  }
}

export default DragonSprite;
