import type { SaveData } from '@/types';

const SAVE_KEY = 'dragons_save_v1';
const SAVE_VERSION = 1;

/**
 * SaveManager — загрузка/сохранение прогресса в LocalStorage (JSON-снимок).
 * Таймеры считаются от system timestamp, серверной валидации нет.
 * См. GDD «Сохранение прогресса» и docs/tasks/04-save-load-system.md.
 */
export const SaveManager = {
  load(): SaveData | null {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    try {
      const data = JSON.parse(raw) as SaveData;
      // TODO: миграции при изменении version (task-04).
      return data;
    } catch {
      console.warn('[SaveManager] повреждённое сохранение, игнорирую');
      return null;
    }
  },

  save(data: SaveData): void {
    data.version = SAVE_VERSION;
    data.last_save = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  },

  /** Стартовый стейт нового игрока (см. GDD «MVP»). */
  createNew(): SaveData {
    return {
      version: SAVE_VERSION,
      player_level: 1,
      xp: 0,
      coins: 0,
      gems: 0,
      unlocked_islands: ['ashen'],
      dragons: [],
      book_discovered: [],
      gardens: [],
      resources: {},
      breeding: { active: null },
      incubator: [],
      last_save: Date.now(),
    };
  },

  reset(): void {
    localStorage.removeItem(SAVE_KEY);
  },
};
