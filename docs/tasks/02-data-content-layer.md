# 02 — Слой данных и загрузка JSON-контента

**Фаза:** 0 — Фундамент · **Зависит от:** 00, 01

## Цель

Весь контент игры (драконы, растения, рецепты, заказы, острова) — в JSON-файлах,
которые балансируются **без правки кода**. Загрузка через `Phaser.load.json` в
PreloadScene, доступ через индексированный `ContentLoader`.

## Что уже есть

- `src/types/index.ts` — типы `DragonDef`, `PlantDef`, `BreedRecipe`, состояния
  сохранения.
- `src/systems/ContentLoader.ts` — индексирует контент по `id`, метод `findRecipe`.
- `public/data/dragons.json` (7 обычных), `plants.json` (11), `breeding.json` (3).

## Что делать

1. **Загрузка в PreloadScene.** Раскомментировать/добавить:
   ```ts
   this.load.json('dragons', 'data/dragons.json');
   this.load.json('plants', 'data/plants.json');
   this.load.json('breeding', 'data/breeding.json');
   // позже: orders.json, islands.json, buildings.json, expeditions.json
   ```
   В `create()`: `ContentLoader.init(this)` — индексирует из cache.
2. **Валидация на загрузке (dev).** Лёгкая проверка целостности (в dev-режиме):
   - каждый `result`/`parent_*` рецепта существует в `dragons`;
   - каждый `plant` рецепта существует в `plants`;
   - нет дублей `id`.
   Падать с понятной ошибкой в консоль — экономит часы отладки контента.
3. **Расширить типы** под будущий контент: `OrderDef`, `IslandDef`, `BuildingDef`,
   `ExpeditionRouteDef` (заполнятся в фазах 4–5, но типы завести сейчас).
4. **Единый реестр файлов.** `src/data/manifest.ts` со списком всех JSON-ключей и
   путей — один источник для PreloadScene и для проверки валидации.

## Структура JSON (см. GDD «Техническая база»)

Дракон, рецепт скрещивания и снимок сохранения уже описаны в `src/types/index.ts`.
Соответствуют примерам JSON из GDD один-в-один (поля `production_per_hour`,
`favorite_food`, `parent_ids`, `chance`, `boost_plant`, `breed_time_hours` и т.д.).

## Definition of Done

- [  ] JSON грузятся в PreloadScene, `ContentLoader.init` вызывается в `create`.
- [  ] `ContentLoader.dragon('embrix')` возвращает корректный объект.
- [  ] `findRecipe('embrix','terravur')` находит `breed_fire_earth` (порядок не важен).
- [  ] Dev-валидация ловит несуществующий `result`/`plant` и пишет в консоль.
- [  ] Добавление нового дракона = правка только JSON, без TS.

## Ссылки на GDD

- «Техническая база» → Данные (контент), Структура данных дракона/скрещивания.
