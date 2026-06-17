# 05 — Сетка острова и размещение построек

**Фаза:** 1 — Ядро фермы · **Статус:** ✅ выполнено (рендер/логика) · **Зависит от:** 01, 03

## Цель

Остров — изометрическая сетка тайлов (клетка 64×64 px). Здания занимают
прямоугольные области. Игрок размещает/перемещает их с проверкой занятости и
запретом ставить на воду/скалы/закрытую землю.

## Модель данных (реализованная)

Форма острова задаётся **текстовой картой** (`public/data/islands.json`), каждый
символ — тип клетки из `terrain.json`. Размер сетки выводится из карты.

```ts
interface IslandDef {
  id: string;            // 'ashen'
  name: string;
  biome: BiomeType;
  unlock_level: number; unlock_cost: number;
  map: string[];         // строки символов → клетки (cols = max длина строки, rows = число строк)
}
interface TerrainDef { kind; name; land; buildable; unlocked?; color; sprite? }
interface Placement {
  uid: string; buildingId: string; refId?: string;
  x: number; y: number;  // левый-верхний угол в клетках
  w: number; h: number;  // размер в клетках
}
```

Размеры построек — в `public/data/buildings.json`. Расчищенные клетки хранятся
отдельно: `cleared_cells[islandId]: [x,y][]`.

## Что сделано

1. **Сетка** `src/systems/GridSystem.ts` — занятость/открытость клеток, `canPlace`,
   `place`, `remove`, `invalidCells`, `nearestFreeCell`, `isClearable`, `occupantAt`.
   Координатные преобразования (`worldToCell`/`cellToWorld`/`islandRect`) — чистые
   функции в `src/systems/iso.ts`.
2. **Логика — в сторе** (`store/slices/islandSlice.ts`): `setCurrentIsland` строит
   транзиентную `grid`, `placeBuilding`/`moveBuilding`/`removeBuilding`/`clearCell`
   валидируют через grid, списывают монеты (через `gameSlice`) и обновляют данные.
3. **Рендер — в Phaser** (только визуал): `TileGrid` рисует тайлы (закрытая
   застраиваемая земля — затемнённая), `BuildingSprite` — изо-коробки зданий.
   Сцена слушает мост и пересобирает спрайты (`syncBuildings`/`syncGround`).
4. **Режим размещения.** Кнопка «Построить» (React) → `usePhaserBridge.enterBuildMode`
   → ghost-превью следует за курсором (snap to grid), зелёный/красный по `invalidCells`.
   Ghost-кнопки (повернуть/готово/отмена) — React-оверлей, позиция из `useUIStore`.
5. **Перемещение/снос.** Тап/долгий тап по зданию → React `ActionPanel`:
   «Переместить» (`enterMoveMode`) / «Снести» (`removeBuilding`).
6. **Расчистка земли.** Тап по закрытой клетке → `ClearPanel` → `clearCell` за монеты.
7. **Камера.** Drag-pan + pinch-zoom, clamp к границам острова (`cam.setBounds`).

## Definition of Done

- [x] Нельзя поставить здание на воду/скалу/закрытую землю или поверх другого.
- [x] Призрак подсвечивается зелёным/красным корректно.
- [x] Здание сохраняется (позиция в клетках) и восстанавливается из persist.
- [x] Камера панорамируется и зумится в пределах острова.
- [x] Расчистка закрытой земли работает и стоит монет.

## Ссылки на GDD

- «Сетка острова и размеры построек», «Пример расстановки (остров 1)».
