import type Phaser from 'phaser';
import {
  ISO_TILE_HALF_WIDTH,
  ISO_TILE_HALF_HEIGHT,
  ISO_BUILDING_HEIGHT,
  drawIsoBox,
  cellToWorld,
} from '@game/shared/iso';
import ContentLoader from '@game/systems/ContentLoader';
import { DRAGON_STAGE } from '@/types/dragon';
import type { DragonState } from '@/types/dragon';
import type { Placement } from '@/types/island';
import type { GetAccumulated } from '@/types/dragon';
import { PHASER_LABEL_STYLE } from '@game/shared/style';
import { PLACEHOLDER_NEST_COLOR, placeholderDragonColor } from '@game/shared/placeholderArt';
import { calcBuildingDepth } from '../shared/building';

const BUBBLE_REFRESH_INTERVAL_MS = 3_000;

class NestSprite {
  readonly container: Phaser.GameObjects.Container;
  private bubble!: Phaser.GameObjects.Arc;
  private bubbleText!: Phaser.GameObjects.Text;
  private dragon: DragonState | null;
  private readonly getAccumulated: GetAccumulated;
  private readonly scene: Phaser.Scene;
  private timer: Phaser.Time.TimerEvent | null = null;
  private pulseTween: Phaser.Tweens.Tween | null = null;
  private wasAtCap = false;

  constructor(
    scene: Phaser.Scene,
    originX: number,
    originY: number,
    placement: Placement,
    dragon: DragonState | null,
    getAccumulated: GetAccumulated,
  ) {
    this.scene = scene;
    this.dragon = dragon;
    this.getAccumulated = getAccumulated;

    const { x: wx, y: wy } = cellToWorld(placement.x, placement.y, originX, originY);
    const w = placement.w;
    const h = placement.h;

    const roofCenterX = ((w - h) * ISO_TILE_HALF_WIDTH) / 2;
    const roofCenterY = ((w + h) * ISO_TILE_HALF_HEIGHT) / 2 - ISO_BUILDING_HEIGHT;
    const roofNorthY = -ISO_BUILDING_HEIGHT;

    const graphics = scene.add.graphics();
    drawIsoBox(graphics, 0, 0, w, h, PLACEHOLDER_NEST_COLOR, 0.92);

    const children: Phaser.GameObjects.GameObject[] = [graphics];

    if (dragon) {
      const def = ContentLoader.dragon(dragon.id);
      const color = placeholderDragonColor(def?.element);

      if (dragon.stage === DRAGON_STAGE.ADULT) {
        children.push(scene.add.arc(roofCenterX, roofCenterY, 12, 0, 360, false, color, 0.88));
      } else {
        children.push(scene.add.arc(roofCenterX, roofCenterY, 7, 0, 360, false, color, 0.45));
      }

      const dragonName = dragon.nickname ?? def?.name ?? '';
      if (dragonName) {
        const stageTag = dragon.stage !== DRAGON_STAGE.ADULT ? ` [${dragon.stage}]` : '';
        children.push(
          scene.add
            .text(roofCenterX, roofNorthY - 12, dragonName + stageTag, {
              ...PHASER_LABEL_STYLE,
              fontSize: '10px',
            })
            .setOrigin(0.5),
        );
      }
    } else {
      const buildingName = ContentLoader.building(placement.buildingId)?.name ?? 'Гнездо';
      children.push(
        scene.add
          .text(roofCenterX, roofCenterY, buildingName, {
            ...PHASER_LABEL_STYLE,
            wordWrap: { width: w * ISO_TILE_HALF_WIDTH * 1.4 },
          })
          .setOrigin(0.5),
      );
    }

    this.bubble = scene.add
      .arc(roofCenterX, roofNorthY - 26, 13, 0, 360, false, 0x33cc77, 0.9)
      .setVisible(false);
    this.bubbleText = scene.add
      .text(roofCenterX, roofNorthY - 26, '', { ...PHASER_LABEL_STYLE, fontSize: '10px' })
      .setOrigin(0.5)
      .setVisible(false);
    children.push(this.bubble, this.bubbleText);

    this.container = scene.add
      .container(wx, wy, children)
      .setDepth(calcBuildingDepth(placement.x, placement.y));

    this.timer = scene.time.addEvent({
      delay: BUBBLE_REFRESH_INTERVAL_MS,
      callback: () => this.refresh(),
      loop: true,
    });

    this.refresh();
  }

  refresh(): void {
    if (!this.dragon || this.dragon.stage !== DRAGON_STAGE.ADULT) {
      this.hideBubble();
      return;
    }

    const { amount, atCap } = this.getAccumulated(this.dragon.uid);

    if (amount <= 0) {
      this.hideBubble();
      return;
    }

    this.bubble.setVisible(true);
    this.bubbleText.setVisible(true).setText(amount >= 1000 ? '1k' : String(amount));

    if (atCap && !this.wasAtCap) this.startPulse();
    else if (!atCap && this.wasAtCap) this.stopPulse();
    this.wasAtCap = atCap;
  }

  private hideBubble(): void {
    this.bubble.setVisible(false);
    this.bubbleText.setVisible(false);
    this.stopPulse();
    this.wasAtCap = false;
  }

  private startPulse(): void {
    if (this.pulseTween) return;
    this.pulseTween = this.scene.tweens.add({
      targets: [this.bubble, this.bubbleText],
      scaleX: 1.25,
      scaleY: 1.25,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private stopPulse(): void {
    if (!this.pulseTween) return;
    this.pulseTween.stop();
    this.pulseTween = null;
    this.bubble.setScale(1);
    this.bubbleText.setScale(1);
  }

  updateDragon(dragon: DragonState | null): void {
    this.dragon = dragon;
    this.refresh();
  }

  destroy(): void {
    this.timer?.destroy();
    this.stopPulse();
    this.container.destroy();
  }
}

export default NestSprite;
