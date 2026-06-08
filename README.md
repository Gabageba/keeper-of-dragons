# 🐉 Архипелаг Драконов

Чиби драконья ферма-коллекционер на **Phaser 3 + TypeScript**. Соло пет-проект:
веб + мобилки (Capacitor), весь прогресс на клиенте, таймеры от системного времени.

> «Dragon City встречает Hay Day — но соло, на Phaser, с милыми чиби-драконами,
> магическими садами и коллекцией из 56+ видов.»

Полное описание игры — в [dragon_farm_gdd.html](dragon_farm_gdd.html) (Game Design Document v1.0).

## Запуск

```bash
npm install
npm run dev        # дев-сервер Vite на http://localhost:5173
npm run build      # прод-сборка (tsc --noEmit + vite build)
npm run typecheck  # только проверка типов
```

## Структура

```
src/
  config.ts          конфиг Phaser, размеры, список сцен
  main.ts            точка входа
  scenes/            Boot, Preload, Island, UI (+ Breeding, Book, Market, Map позже)
  systems/           SaveManager, ContentLoader (+ ResourceManager, BreedingSystem...)
  types/             TypeScript-типы (соответствуют JSON-схемам GDD)
public/
  data/              JSON-контент: dragons, plants, breeding (+ orders, islands...)
docs/
  tasks/             детальные ТЗ по каждому пункту плана
TODO.md              мастер-чеклист со ссылками на задачи
```

## План работ

Весь план разбит по фазам — см. [TODO.md](TODO.md). Каждый пункт имеет
подробный MD-файл в [docs/tasks/](docs/tasks/).
