# 03 — Глобальный стейт и шина событий

**Фаза:** 0 — Фундамент · **Зависит от:** 02

## Цель

Один источник правды о состоянии игрока (`SaveData`) + реактивные уведомления об
изменениях, чтобы UIScene и игровые объекты обновлялись автоматически (валюты,
уровень, ресурсы), без ручной синхронизации между сценами.

## Что делать

1. **Стор `src/systems/GameState.ts`.** Обёртка над `SaveData`:
   - хранит текущий снимок (загружается из `SaveManager` при старте, см. task-04);
   - геттеры: `coins`, `gems`, `level`, `resourceOf(id)`, `dragons`, `gardens`;
   - мутации с проверками: `addCoins(n)`, `spendCoins(n): boolean`,
     `addResource(id, n)`, `spendResource(id, n): boolean`, `addXp(n)`,
     `addDragon(state)`, `discoverInBook(id)`;
   - каждая мутация эмитит событие через шину (ниже) и помечает «dirty» для автосейва.
2. **Шина событий `src/systems/EventBus.ts`.** Тонкая обёртка над
   `Phaser.Events.EventEmitter` (один глобальный инстанс) с типизированными
   событиями:
   ```ts
   type GameEvents = {
     'coins:changed': number;
     'gems:changed': number;
     'resource:changed': { id: string; amount: number };
     'xp:changed': { xp: number; level: number };
     'dragon:added': DragonState;
     'book:discovered': string;
   };
   ```
   Типизация через дженерик-обёртку `on<K>(event, handler)` / `emit<K>(event, payload)`.
3. **Подписка UI.** UIScene подписывается на `coins:changed`, `gems:changed`,
   `xp:changed` и обновляет тексты. Игровые объекты — на нужные им события.
   Не забывать отписку в `shutdown` сцены.
4. **Без глобальных синглтонов-спагетти.** `GameState` и `EventBus` — единственные
   глобальные синглтоны. Всё остальное получает их по импорту, не через `window`.

## Definition of Done

- [ ] `GameState.spendCoins` возвращает `false` и не уходит в минус при нехватке.
- [ ] Изменение монет мгновенно отражается в UIScene (через событие).
- [ ] Все мутации проходят через стор (нет прямой записи в `SaveData` из сцен).
- [ ] Подписки корректно снимаются при остановке сцены (нет утечек/двойных хэндлеров).

## Ссылки на GDD

- «Сохранение прогресса (JSON-снимок)» — структура того, что хранит стор.
