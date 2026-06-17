# 01 — Архитектура слоёв (Zustand / Phaser / React)

**Фаза:** 0 — Фундамент · **Статус:** ✅ выполнено · **Зависит от:** 00

## Цель

Чистое разделение ответственности: **Zustand** — единственный источник правды
(логика + состояние), **Phaser** — только рендер острова, **React** — весь UI
поверх canvas. Модальные экраны (Книга, Скрещивание, Заказы, Инвентарь) — React,
открываются без перезагрузки острова.

## Слои

```
Zustand (store/)  ──источник правды──►  React (ui/)        весь UI поверх canvas
      ▲                                     │
      │ subscribe (storeBridge)             │ usePhaserBridge (команды)
      │ колбэки в registry                  ▼
   Phaser (phaser/) ──────────────────►  рендер острова (только визуал)
```

## Сцены Phaser

| Сцена | Назначение | Когда |
|---|---|---|
| `BootScene` | Прогресс-бар, загрузка JSON/спрайтов, инициализация стора и оффлайна (через мост), старт Island | первой |
| `IslandScene` | Рендер острова: `TileGrid`, `BuildingSprite`, `DragonSprite`, ghost-превью, камера, ввод | после Boot |
| `MapScene` | Карта архипелага (каркас) | по кнопке «Карта» |

UIScene/ModalScene/BreedingScene/BookScene/MarketScene **удалены** — это всё теперь
React-компоненты в `ui/`.

## Правила

1. **Phaser не импортирует стор.** Сцена получает `IslandCallbacks` из
   `game.registry`: запросы читают транзиентную сетку (только чтение), команды
   вызывают экшены стора, UI-колбэки пишут в `useUIStore`.
2. **`phaser/bridge/storeBridge.ts`** — единственная точка связи: кладёт колбэки в
   registry, подписывается на стор (`subscribeWithSelector`) и дёргает методы синка
   визуала сцены (`syncBuildings`/`syncGround`).
3. **React → Phaser команды** идут через `hooks/usePhaserBridge.ts` (вход в режим
   стройки/перемещения, ghost-кнопки, переключение на карту) — по ссылке на сцену
   из `phaser/gameRef.ts`.
4. **Модалки** — React (`ui/modals/`), состояние открытия — в `useUIStore`
   (`activeModal`), не в Phaser. Остров не перезагружается.
5. **Переключение острова** — `useGameStore.setCurrentIsland(id)` (пересобирает
   сетку); карта — `MapScene` поверх уснувшей `IslandScene`.

## Структура файлов

```
src/phaser/
  PhaserGame.tsx          монтирует canvas, создаёт Phaser.Game, поднимает мост
  gameRef.ts              ссылка на Game/IslandScene для команд React→Phaser
  scenes/{BootScene,IslandScene,MapScene}.ts
  objects/{TileGrid,BuildingSprite,DragonSprite}.ts
  bridge/{storeBridge.ts, types.ts}
src/ui/{hud,island,modals}/  — весь React-интерфейс
src/hooks/{useGameTick,usePhaserBridge}.ts
```

## Definition of Done

- [x] Открытие/закрытие любой модалки не перезагружает остров.
- [x] HUD с валютами виден поверх canvas (React, не Phaser-сцена).
- [x] Phaser-сцены не импортируют стор — только через мост/registry.
- [x] Переход на карту и обратно работает (`MapScene` ↔ `IslandScene`).

## Ссылки на GDD

- «Техническая база» → Стек, Архитектура слоёв, Сцены Phaser.
