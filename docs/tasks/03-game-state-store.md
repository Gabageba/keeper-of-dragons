# 03 — Глобальный стейт (Zustand)

**Фаза:** 0 — Фундамент · **Статус:** ✅ выполнено · **Зависит от:** 02

## Цель

Один источник правды о состоянии игрока на **Zustand**. Вся игровая логика и данные
живут в сторе; React-компоненты подписываются хуками-селекторами и обновляются
автоматически, а Phaser читает состояние через мост. Прежние `GameState` (синглтон)
и `EventBus` (шина) больше не нужны — Zustand даёт и стор, и реактивность.

## Что сделано

1. **Один стор со слайсами** `src/store/useGameStore.ts` (`create` + `persist` +
   `subscribeWithSelector`), собранный из слайсов `src/store/slices/`:
   - `gameSlice` — `coins`, `gems`, `player_level`, `xp`, `resources`,
     `unlocked_islands`, `book_discovered` + мутации (`addCoins`, `spendCoins`,
     `addGems`, `spendGems`, `addResource`, `spendResource`, `addXp`,
     `discoverInBook`, `unlockIsland`);
   - `dragonsSlice` — `dragons` + `addDragon`, `collectResource`;
   - `islandSlice` — `placements`, `cleared_cells`, `currentIslandId`, транзиентная
     `grid` (GridSystem) + `setCurrentIsland`, `placeBuilding`, `moveBuilding`,
     `removeBuilding`, `clearCell`;
   - `gardenSlice`, `breedingSlice` — каркас (растения/скрещивание/инкубатор);
   - корень — `version`, `last_save`, `tick`, `applyOffline`, `reset`.
   Кросс-слайс доступ (cap ресурсов зависит от драконов) — через `get()`.
2. **Проверки в мутациях.** `spendCoins`/`spendGems`/`spendResource` возвращают
   `false` и не уходят в минус; `placeBuilding`/`clearCell` валидируют и списывают.
3. **Селектор-хуки** `useDragonsStore`/`useIslandStore`/`useGardenStore`/
   `useBreedingStore` — тонкие фасады над корневым стором (через `useShallow` для
   групп экшенов). Базовые валюты читаются прямо из `useGameStore`.
4. **Эфемерный UI-стор** `src/store/useUIStore.ts` — модалки, панели, позиция
   ghost-кнопок, `gameReady`, оффлайн-сводка. Не сохраняется. Сюда Phaser пишет
   через колбэки моста.
5. **Реактивность.** React — хуки-селекторы. Phaser — `useGameStore.subscribe`
   через мост (`storeBridge`), отписка при размонтировании `PhaserGame`.

## Definition of Done

- [x] `spendCoins` возвращает `false` и не уходит в минус при нехватке.
- [x] Изменение монет мгновенно отражается в HUD (хук-селектор).
- [x] Все мутации проходят через стор (нет прямой записи в состояние из сцен).
- [x] Подписки моста снимаются при размонтировании (нет утечек).

## Ссылки на GDD

- «Техническая база» → Состояние (Zustand), «Сохранение прогресса (JSON-снимок)».
