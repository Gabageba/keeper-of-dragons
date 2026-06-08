import type { SaveData } from '@/types';

const SAVE_KEY = 'dragons_save_v1';
const BACKUP_KEY = 'dragons_save_backup';
const SAVE_VERSION = 1;

export const SaveManager = {
  load(): SaveData | null {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    try {
      const data = JSON.parse(raw) as SaveData;
      return migrate(data);
    } catch {
      console.warn('[SaveManager] повреждённое сохранение, игнорирую');
      return null;
    }
  },

  save(data: SaveData): void {
    const current = localStorage.getItem(SAVE_KEY);
    if (current) localStorage.setItem(BACKUP_KEY, current);

    data.version = SAVE_VERSION;
    data.last_save = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  },

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
    localStorage.removeItem(BACKUP_KEY);
  },
};

function migrate(data: SaveData): SaveData {
  switch (data.version) {
    // case 1: return migrateV1toV2(data);
    default:
      return data;
  }
}
