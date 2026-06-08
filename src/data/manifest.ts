/** Единый реестр JSON-контента. Используется в PreloadScene и dev-валидации.
 *  active: false — файл ещё не создан, грузить не нужно (фазы 4–5). */
export const DATA_MANIFEST = [
  { key: 'dragons',     path: 'data/dragons.json',     active: true  },
  { key: 'plants',      path: 'data/plants.json',      active: true  },
  { key: 'breeding',    path: 'data/breeding.json',    active: true  },
  { key: 'orders',      path: 'data/orders.json',      active: false },
  { key: 'islands',     path: 'data/islands.json',     active: false },
  { key: 'buildings',   path: 'data/buildings.json',   active: false },
  { key: 'expeditions', path: 'data/expeditions.json', active: false },
] as const;

export type DataKey = (typeof DATA_MANIFEST)[number]['key'];
