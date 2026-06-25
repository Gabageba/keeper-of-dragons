import type Phaser from 'phaser';
import {
  ISO_TILE_HALF_WIDTH,
  ISO_TILE_HALF_HEIGHT,
  ISO_BUILDING_HEIGHT,
  drawIsoBox,
  cellToWorld,
} from '@game/shared/iso';
import ContentLoader from '@game/systems/ContentLoader';
import type { Placement } from '@/types/island';
import { PHASER_LABEL_STYLE } from '@game/shared/style';
import { placeholderBuildingColor } from '@game/shared/placeholderArt';
import { calcBuildingDepth } from '../shared/building';

const REFRESH_INTERVAL_MS = 5_000;

class GardenSprite {
  readonly container: Phaser.GameObjects.Container;
  private bubble: Phaser.GameObjects.Arc;
  private bubbleText: Phaser.GameObjects.Text;
  private readonly gardenIndex: number;
  private readonly getReadyCount: (gardenIndex: number) => number;
  private readonly scene: Phaser.Scene;
  private timer: Phaser.Time.TimerEvent | null = null;
  private pulseTween: Phaser.Tweens.Tween | null = null;
  private wasPulsing = false;
  private bubbleBaseY = 0;

  constructor(
    scene: Phaser.Scene,
    originX: number,
    originY: number,
    placement: Placement,
    gardenIndex: number,
    getReadyCount: (gardenIndex: number) => number,
  ) {
    this.scene = scene;
    this.gardenIndex = gardenIndex;
    this.getReadyCount = getReadyCount;

    const def = ContentLoader.building(placement.buildingId);
    const color = placeholderBuildingColor(def?.type);
    const { x: wx, y: wy } = cellToWorld(placement.x, placement.y, originX, originY);
    const w = placement.w;
    const h = placement.h;
    const depth = calcBuildingDepth(placement.x, placement.y);

    const roofCenterX = ((w - h) * ISO_TILE_HALF_WIDTH) / 2;
    const roofCenterY = ((w + h) * ISO_TILE_HALF_HEIGHT) / 2 - ISO_BUILDING_HEIGHT;
    const roofNorthY = -ISO_BUILDING_HEIGHT;
    this.bubbleBaseY = roofNorthY - 26;

    const graphics = scene.add.graphics();
    drawIsoBox(graphics, 0, 0, w, h, color, 0.92);

    const label = scene.add
      .text(roofCenterX, roofCenterY, def?.name ?? placement.buildingId, {
        ...PHASER_LABEL_STYLE,
        wordWrap: { width: w * ISO_TILE_HALF_WIDTH * 1.4 },
      })
      .setOrigin(0.5);

    this.bubble = scene.add
      .arc(roofCenterX, this.bubbleBaseY, 13, 0, 360, false, 0x44cc66, 0.9)
      .setVisible(false);
    this.bubbleText = scene.add
      .text(roofCenterX, this.bubbleBaseY, '', { ...PHASER_LABEL_STYLE, fontSize: '10px' })
      .setOrigin(0.5)
      .setVisible(false);

    this.container = scene.add
      .container(wx, wy, [graphics, label, this.bubble, this.bubbleText])
      .setDepth(depth);

    this.timer = scene.time.addEvent({
      delay: REFRESH_INTERVAL_MS,
      callback: () => this.refresh(),
      loop: true,
    });

    this.refresh();
  }

  refresh(): void {
    const count = this.getReadyCount(this.gardenIndex);
    if (count <= 0) {
      this.hideBubble();
      return;
    }

    this.bubble.setVisible(true);
    this.bubbleText.setVisible(true).setText(String(count));

    if (!this.wasPulsing) this.startPulse();
    this.wasPulsing = true;
  }

  private hideBubble(): void {
    this.bubble.setVisible(false);
    this.bubbleText.setVisible(false);
    this.stopPulse();
    this.wasPulsing = false;
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

  destroy(): void {
    this.timer?.destroy();
    this.stopPulse();
    this.container.destroy();
  }
}

export default GardenSprite;
