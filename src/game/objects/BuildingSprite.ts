import type Phaser from 'phaser';
import {
  ISO_TILE_HALF_WIDTH,
  ISO_TILE_HALF_HEIGHT,
  ISO_BUILDING_HEIGHT,
  drawIsoBox,
} from '@game/shared/iso';
import ContentLoader from '@game/systems/ContentLoader';
import type { Placement } from '@/types/island';
import { PHASER_LABEL_STYLE } from '@game/shared/style';
import { cellToWorld } from '@game/shared/iso';
import { placeholderBuildingColor } from '@game/shared/placeholderArt';
import { calcBuildingDepth } from '../shared/building';

class BuildingSprite {
  readonly container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, originX: number, originY: number, placement: Placement) {
    const def = ContentLoader.building(placement.buildingId);
    const color = placeholderBuildingColor(def?.type);

    const graphics = scene.add.graphics();
    drawIsoBox(graphics, 0, 0, placement.w, placement.h, color, 0.92);

    const label = scene.add
      .text(
        ((placement.w - placement.h) * ISO_TILE_HALF_WIDTH) / 2,
        ((placement.w + placement.h) * ISO_TILE_HALF_HEIGHT) / 2 - ISO_BUILDING_HEIGHT,
        def?.name ?? placement.buildingId,
        { ...PHASER_LABEL_STYLE, wordWrap: { width: placement.w * ISO_TILE_HALF_WIDTH * 1.4 } },
      )
      .setOrigin(0.5);

    const { x: wx, y: wy } = cellToWorld(placement.x, placement.y, originX, originY);
    this.container = scene.add
      .container(wx, wy, [graphics, label])
      .setDepth(calcBuildingDepth(placement.x, placement.y));
  }

  destroy(): void {
    this.container.destroy();
  }
}

export default BuildingSprite;
