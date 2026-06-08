import { SaveManager } from '@/systems/SaveManager';
import { EventBus } from '@/systems/EventBus';
import type { SaveData, DragonState, GardenState } from '@/types';

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

  get coins(): number {
    return this.data.coins;
  }

  get gems(): number {
    return this.data.gems;
  }

  get level(): number {
    return this.data.player_level;
  }

  get xp(): number {
    return this.data.xp;
  }

  get dragons(): readonly DragonState[] {
    return this.data.dragons;
  }

  get gardens(): readonly GardenState[] {
    return this.data.gardens;
  }

  resourceOf(id: string): number {
    return this.data.resources[id] ?? 0;
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
    this.data.resources[id] = (this.data.resources[id] ?? 0) + n;
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
    // Level-up loop: advance while XP meets next level threshold.
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
