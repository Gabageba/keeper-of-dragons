import type Phaser from 'phaser';
import { ISO_HALF_W, ISO_HALF_H, ISO_BLDG_H } from '@/config';
import ContentLoader from '@/systems/ContentLoader';
import { drawIsoBox, cellToWorld } from '@/systems/iso';
import type { Placement } from '@/types';

const FALLBACK_COLOR = 0x888888;
const BUILDING_COLOR: Record<string, number> = {
  nest: 0x8b4513,
  incubator: 0xff8c00,
  breeding: 0xdc143c,
  market: 0xdaa520,
  library: 0x6a0dad,
  forge: 0x696969,
  map_table: 0xd2b48c,
  temple: 0xffd700,
  keepers_hall: 0x4169e1,
  decor: 0x228b22,
  garden: 0x006400,
};

export const LABEL_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'ElMessiri, serif',
  fontSize: '12px',
  color: '#ffffff',
  align: 'center',
  stroke: '#000000',
  strokeThickness: 2,
};

/** Глубина для изо-сортировки клетки (x,y). */
export const depthFor = (x: number, y: number): number => {
  return 10 + x + y;
};

/**
 * BuildingSprite — изометрический спрайт постройки (коробка + подпись). Чистый
 * рендер по данным Placement из стора.
 */
class BuildingSprite {
  readonly container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, originX: number, originY: number, p: Placement) {
    const def = ContentLoader.building(p.buildingId);
    const color = def ? (BUILDING_COLOR[def.type] ?? FALLBACK_COLOR) : FALLBACK_COLOR;

    const gfx = scene.add.graphics();
    drawIsoBox(gfx, 0, 0, p.w, p.h, color, 0.92);

    const label = scene.add
      .text(
        ((p.w - p.h) * ISO_HALF_W) / 2,
        ((p.w + p.h) * ISO_HALF_H) / 2 - ISO_BLDG_H,
        def?.name ?? p.buildingId,
        { ...LABEL_STYLE, wordWrap: { width: p.w * ISO_HALF_W * 1.4 } },
      )
      .setOrigin(0.5);

    const { x: wx, y: wy } = cellToWorld(p.x, p.y, originX, originY);
    this.container = scene.add.container(wx, wy, [gfx, label]).setDepth(depthFor(p.x, p.y));
  }

  destroy(): void {
    this.container.destroy();
  }
}

export default BuildingSprite;
