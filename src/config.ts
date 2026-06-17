/** Размер одной клетки сетки острова в пикселях (см. GDD «Сетка острова»). */
export const TILE_SIZE = 64;

/** Изометрия: половина ширины ромба-тайла. */
export const ISO_HALF_W = TILE_SIZE; // 64 px
/** Изометрия: половина высоты ромба-тайла. */
export const ISO_HALF_H = TILE_SIZE / 2; // 32 px
/** Визуальная высота здания (количество пикселей от земли до крыши). */
export const ISO_BLDG_H = 28;

/** Базовое логическое разрешение. Масштабируется под экран через Scale.FIT. */
export const GAME_WIDTH = 1920;
export const GAME_HEIGHT = 1080;
