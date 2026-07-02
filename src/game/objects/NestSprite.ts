import type Phaser from 'phaser';
import {
  ISO_TILE_HALF_WIDTH,
  ISO_TILE_HALF_HEIGHT,
  ISO_BUILDING_HEIGHT,
  drawIsoBox,
  cellToWorld,
} from '@game/shared/iso';
import ContentLoader from '@game/systems/ContentLoader';
import { DRAGON_STAGE, PRODUCTION_STATE } from '@/types/dragon';
import type { DragonState } from '@/types/dragon';
import type { Placement } from '@/types/island';
import type { GetProduction } from '@/types/dragon';
import { PHASER_LABEL_STYLE } from '@game/shared/style';
import { PLACEHOLDER_NEST_COLOR } from '@game/shared/placeholderArt';
import { calcBuildingDepth } from '../shared/building';
import DragonSprite from './DragonSprite';

const BUBBLE_REFRESH_INTERVAL_MS = 3_000;

class NestSprite {
  readonly container: Phaser.GameObjects.Container;
  private bubble!: Phaser.GameObjects.Arc;
  private bubbleText!: Phaser.GameObjects.Text;
  private dragon: DragonState | null;
  private dragonSprite: DragonSprite | null = null;
  private readonly getProduction: GetProduction;
  private readonly scene: Phaser.Scene;
  private timer: Phaser.Time.TimerEvent | null = null;
  private pulseTween: Phaser.Tweens.Tween | null = null;
  private wasPulsing = false;
  private isCollecting = false;
  private _isReady = false;
  private bubbleBaseY = 0;

  constructor(
    scene: Phaser.Scene,
    originX: number,
    originY: number,
    placement: Placement,
    dragon: DragonState | null,
    getProduction: GetProduction,
  ) {
    this.scene = scene;
    this.dragon = dragon;
    this.getProduction = getProduction;

    const { x: wx, y: wy } = cellToWorld(placement.x, placement.y, originX, originY);
    const w = placement.w;
    const h = placement.h;
    const depth = calcBuildingDepth(placement.x, placement.y);

    const roofCenterX = ((w - h) * ISO_TILE_HALF_WIDTH) / 2;
    const roofCenterY = ((w + h) * ISO_TILE_HALF_HEIGHT) / 2 - ISO_BUILDING_HEIGHT;
    const roofNorthY = -ISO_BUILDING_HEIGHT;
    this.bubbleBaseY = roofNorthY - 26;

    const graphics = scene.add.graphics();
    drawIsoBox(graphics, 0, 0, w, h, PLACEHOLDER_NEST_COLOR, 0.92);

    const children: Phaser.GameObjects.GameObject[] = [graphics];

    if (dragon) {
      this.dragonSprite = new DragonSprite(
        scene,
        wx + roofCenterX,
        wy + roofCenterY,
        depth + 1,
        dragon,
      );

      const def = ContentLoader.dragon(dragon.id);
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

    this.container = scene.add.container(wx, wy, children).setDepth(depth);

    this.timer = scene.time.addEvent({
      delay: BUBBLE_REFRESH_INTERVAL_MS,
      callback: () => this.refresh(),
      loop: true,
    });

    this.refresh();
  }

  // ─── bubble ──────────────────────────────────────────────────────────────────

  refresh(): void {
    if (!this.dragon || this.dragon.stage !== DRAGON_STAGE.ADULT) {
      this.hideBubble();
      return;
    }

    const prod = this.getProduction(this.dragon.uid);
    this._isReady = prod.state === PRODUCTION_STATE.READY;

    // цвет, текст и пульсация по состоянию цикла
    let color = 0x33cc77;
    let text = '';
    let pulse = false;

    switch (prod.state) {
      case PRODUCTION_STATE.READY: {
        color = 0x33cc77; // зелёный — готово к сбору
        text = prod.pending >= 1000 ? '1k' : String(prod.pending);
        pulse = true;
        break;
      }
      case PRODUCTION_STATE.PRODUCING: {
        color = 0xf0a030; // янтарь — зреет
        const minLeft = Math.max(1, Math.ceil((prod.readyAt - Date.now()) / 60_000));
        text = `${minLeft}м`;
        break;
      }
      case PRODUCTION_STATE.FULL: {
        color = 0xff4444; // красный — склад полон
        text = 'МАХ';
        pulse = true;
        break;
      }
      case PRODUCTION_STATE.HUNGRY: {
        color = 0xc9a84c; // золото — голоден, можно покормить
        text = '!';
        break;
      }
    }

    this.bubble.setFillStyle(color, 0.9).setVisible(true);
    this.bubbleText.setVisible(true).setText(text);

    if (pulse && !this.wasPulsing) this.startPulse();
    else if (!pulse && this.wasPulsing) this.stopPulse();
    this.wasPulsing = pulse;
  }

  private hideBubble(): void {
    this.bubble.setVisible(false);
    this.bubbleText.setVisible(false);
    this.stopPulse();
    this.wasPulsing = false;
    this._isReady = false;
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

  // ─── tap ─────────────────────────────────────────────────────────────────────

  get collecting(): boolean {
    return this.isCollecting;
  }

  /** Есть готовая партия, которую можно собрать. */
  get isReady(): boolean {
    return this._isReady;
  }

  playCollect(): void {
    if (this.isCollecting) return;

    if (!this._isReady) return;

    this.isCollecting = true;
    this.dragonSprite?.playCollect();
    this.stopPulse();
    this.scene.tweens.add({
      targets: [this.bubble, this.bubbleText],
      y: '-=36',
      alpha: 0,
      duration: 380,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.bubble.setY(this.bubbleBaseY).setAlpha(0.9);
        this.bubbleText.setY(this.bubbleBaseY).setAlpha(1);
        this.isCollecting = false;
        this.refresh();
      },
    });
  }

  // ─── lifecycle ────────────────────────────────────────────────────────────────

  updateDragon(dragon: DragonState | null): void {
    this.dragon = dragon;
    this.refresh();
  }

  destroy(): void {
    this.timer?.destroy();
    this.stopPulse();
    this.dragonSprite?.destroy();
    this.container.destroy();
  }
}

export default NestSprite;
