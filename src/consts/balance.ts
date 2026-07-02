/** Прибавка к выходу за каждый уровень улучшения дракона (+15%/ур). */
export const YIELD_UPGRADE_BONUS_PER_LEVEL = 0.15;

/** Потолок уровней улучшения выхода. */
export const YIELD_UPGRADE_MAX_LEVEL = 10;

/** Стоимость улучшения выхода `level → level+1` в монетах (геометрический рост). */
export const yieldUpgradeCost = (level: number): number => Math.floor(100 * Math.pow(1.6, level));
