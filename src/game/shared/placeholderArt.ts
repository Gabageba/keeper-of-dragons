// ⚠️ ВРЕМЕННАЯ ГРАФИКА-ЗАГЛУШКА.
// Пока нет реальных спрайтов, постройки / гнёзда / драконы рисуются цветными
// изо-коробками. Все плейсхолдерные цвета собраны здесь — это единственная точка,
// которую нужно удалить, когда появятся текстуры (а вызовы заменить на их загрузку).

import type { Element } from '@/types/dragon';

/** Запасной серый для неизвестных типов построек / стихий. */
export const PLACEHOLDER_FALLBACK_COLOR = 0x888888;

/** Базовый цвет коробки гнезда. */
export const PLACEHOLDER_NEST_COLOR = 0x8b4513;

/** Цвет коробки-заглушки по типу постройки (BuildingDef.type). */
const BUILDING_TYPE_COLORS: Record<string, number> = {
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

/** Цвет метки дракона по стихии. */
const DRAGON_ELEMENT_COLORS: Record<Element, number> = {
  fire: 0xff5533,
  water: 0x3366ff,
  earth: 0x997733,
  storm: 0xcccc33,
  ice: 0x66ddff,
  wind: 0xaaddee,
  nature: 0x44cc44,
  light: 0xffee88,
  shadow: 0x9933cc,
  cosmos: 0x8855ff,
  time: 0xdd9933,
};

export const placeholderBuildingColor = (type: string | undefined): number =>
  (type ? BUILDING_TYPE_COLORS[type] : undefined) ?? PLACEHOLDER_FALLBACK_COLOR;

export const placeholderDragonColor = (element: Element | undefined): number =>
  (element ? DRAGON_ELEMENT_COLORS[element] : undefined) ?? PLACEHOLDER_FALLBACK_COLOR;
