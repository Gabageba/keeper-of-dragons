# 00 — Каркас проекта (React + Phaser + Zustand + TS + Vite)

**Фаза:** 0 — Фундамент · **Статус:** ✅ выполнено · **Зависит от:** —

## Цель

Получить запускаемый каркас игры: **React 19** (UI) + **Phaser 3** (рендер) +
**Zustand** (состояние) на TypeScript, сборка Vite, единый кодбейс для веба и
(позже) мобилки через Capacitor.

## Что уже сделано (скелет в репозитории)

- `package.json` со скриптами `dev` / `build` / `lint` и зависимостями
  `react`, `react-dom`, `phaser@^3.80`, `zustand`, `@emotion/*`, `typescript`, `vite`.
- `tsconfig.json` — строгий режим (`strict`, `noUnused*`), alias `@/*→ src/*`.
- `vite.config.ts` — `@vitejs/plugin-react` (+ Emotion jsx), alias, dev-сервер
  с `host: true` (тест с телефона в той же сети).
- `index.html` — контейнер `#root`, мета viewport с `viewport-fit=cover` и
  запретом зума (мобилки).
- `src/main.tsx` — точка входа React (`createRoot` → `<App/>`); `src/config.ts` —
  константы Phaser (Scale.FIT, логическое разрешение 1920×1080, `TILE_SIZE = 64`).
- `src/App.tsx` — монтирует `PhaserGame` (canvas) + React-слои (HUD, IslandUI, модалки).
- Сцены Phaser: `BootScene`, `IslandScene`, `MapScene` (см. task-01).
- Стартовый JSON-контент в `public/data/`.

## Проверка готовности (Definition of Done)

- [x] `npm install` отрабатывает без ошибок.
- [x] `npm run build` проходит `tsc --noEmit` и собирает `dist/`.
- [x] `npm run dev` показывает экран загрузки → сетку острова → HUD поверх canvas.
- [x] `npm run lint` чистый (eslint + prettier).
- [x] Проект открывается с телефона по `http://<ip>:5173` в той же сети.

## Дальнейшие штрихи (по желанию)

- Кодсплит Phaser в отдельный чанк (`manualChunks`) — убрать предупреждение о
  размере бандла. Косметика, не приоритет.

## Ссылки на GDD

- «Техническая база (пет-проект)» → Стек, Архитектура слоёв.
