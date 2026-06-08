import { SaveManager } from '@/systems/SaveManager';
import { EventBus } from '@/systems/EventBus';
import { ContentLoader } from '@/systems/ContentLoader';
import type { SaveData, DragonState, GardenState, OfflineSummary } from '@/types';

// Max resources per type unless dragon Вечнозим is present (task-26 will tune this).
const STORAGE_CAP = 1_000;

// XP needed to reach level N (1-indexed, level 1 requires 0 total XP).
function xpForLevel(level: number): number {
  return level <= 1 ? 0 : (level - 1) * 100 * level;
}

class GameStateStore {
  private data!: SaveData;
  dirty = false;

  init(data: SaveData): void {
    this.data = data;
    this.dirty = false;
  }

  // --- Getters ---

  get snapshot(): Readonly<SaveData> {
    return this.data;
  }

  get coins(): number { return this.data.coins; }
  get gems(): number { return this.data.gems; }
  get level(): number { return this.data.player_level; }
  get xp(): number { return this.data.xp; }
  get dragons(): readonly DragonState[] { return this.data.dragons; }
  get gardens(): readonly GardenState[] { return this.data.gardens; }

  resourceOf(id: string): number {
    return this.data.resources[id] ?? 0;
  }

  private get hasInfiniteStorage(): boolean {
    return this.data.dragons.some(d => {
      if (d.stage !== 'adult') return false;
      return ContentLoader.dragon(d.id)?.global_bonus === 'infinite_storage';
    });
  }

  // --- Offline Progress ---

  applyOfflineProgress(): OfflineSummary {
    const now = Date.now();
    const elapsed_ms = now - this.data.last_save;
    const resources_gained: Record<string, number> = {};
    const infinite = this.hasInfiniteStorage;

    for (const dragon of this.data.dragons) {
      if (dragon.stage !== 'adult') continue;

      const def = ContentLoader.dragon(dragon.id);
      if (!def) continue;

      if (dragon.last_collected === 0) {
        dragon.last_collected = now;
        continue;
      }

      const hours = (now - dragon.last_collected) / 3_600_000;
      let rate = def.production_per_hour;

      if (dragon.biome) {
        if (dragon.biome === def.favorite_biome) rate *= 1 + def.biome_buff;
        else if (dragon.biome === def.disliked_biome) rate *= 1 - def.biome_debuff;
      }

      let produced = Math.floor(rate * hours);
      if (produced <= 0) continue;

      if (!infinite) {
        const current = this.data.resources[def.resource] ?? 0;
        produced = Math.min(produced, STORAGE_CAP - current);
        if (produced <= 0) continue;
      }

      this.data.resources[def.resource] = (this.data.resources[def.resource] ?? 0) + produced;
      resources_gained[def.resource] = (resources_gained[def.resource] ?? 0) + produced;
      dragon.last_collected = now;
    }

    let breeding_completed = false;
    if (this.data.breeding.active && this.data.breeding.active.ready_at <= now) {
      breeding_completed = true;
    }

    let eggs_hatched = 0;
    for (const egg of this.data.incubator) {
      if (egg.ready_at <= now) eggs_hatched += 1;
    }

    if (Object.keys(resources_gained).length > 0 || breeding_completed || eggs_hatched > 0) {
      this.dirty = true;
    }

    return { elapsed_ms, resources_gained, breeding_completed, eggs_hatched };
  }

  // --- Mutations ---

  addCoins(n: number): void {
    this.data.coins += n;
    this.dirty = true;
    EventBus.emit('coins:changed', this.data.coins);
  }

  spendCoins(n: number): boolean {
    if (this.data.coins < n) return false;
    this.data.coins -= n;
    this.dirty = true;
    EventBus.emit('coins:changed', this.data.coins);
    return true;
  }

  addGems(n: number): void {
    this.data.gems += n;
    this.dirty = true;
    EventBus.emit('gems:changed', this.data.gems);
  }

  spendGems(n: number): boolean {
    if (this.data.gems < n) return false;
    this.data.gems -= n;
    this.dirty = true;
    EventBus.emit('gems:changed', this.data.gems);
    return true;
  }

  addResource(id: string, n: number): void {
    const current = this.data.resources[id] ?? 0;
    const cap = this.hasInfiniteStorage ? Infinity : STORAGE_CAP;
    this.data.resources[id] = Math.min(current + n, cap);
    this.dirty = true;
    EventBus.emit('resource:changed', { id, amount: this.data.resources[id] });
  }

  spendResource(id: string, n: number): boolean {
    const current = this.data.resources[id] ?? 0;
    if (current < n) return false;
    this.data.resources[id] = current - n;
    this.dirty = true;
    EventBus.emit('resource:changed', { id, amount: this.data.resources[id] });
    return true;
  }

  addXp(n: number): void {
    this.data.xp += n;
    let leveled = false;
    while (this.data.xp >= xpForLevel(this.data.player_level + 1)) {
      this.data.player_level += 1;
      leveled = true;
    }
    this.dirty = true;
    EventBus.emit('xp:changed', { xp: this.data.xp, level: this.data.player_level });
    if (leveled) {
      // Coins/gems display may show level; re-emit so UIScene refreshes.
    }
  }

  addDragon(state: DragonState): void {
    this.data.dragons.push(state);
    this.dirty = true;
    EventBus.emit('dragon:added', state);
  }

  discoverInBook(id: string): void {
    if (this.data.book_discovered.includes(id)) return;
    this.data.book_discovered.push(id);
    this.dirty = true;
    EventBus.emit('book:discovered', id);
  }

  flush(): void {
    if (!this.dirty) return;
    SaveManager.save(this.data);
    this.dirty = false;
  }
}

export const GameState = new GameStateStore();
