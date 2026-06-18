/** Список JSON-файлов контента для загрузки в BootScene.
 *  active: false — файл ещё не создан, не грузим. */
export const CONTENT_MANIFEST = [
  { key: 'dragons', path: 'data/dragons.json', active: true },
  { key: 'plants', path: 'data/plants.json', active: true },
  { key: 'breeding', path: 'data/breeding.json', active: true },
  { key: 'orders', path: 'data/orders.json', active: false },
  { key: 'terrain', path: 'data/terrain.json', active: true },
  { key: 'islands', path: 'data/islands.json', active: true },
  { key: 'buildings', path: 'data/buildings.json', active: true },
  { key: 'expeditions', path: 'data/expeditions.json', active: false },
] as const;

export type ContentKey = (typeof CONTENT_MANIFEST)[number]['key'];
