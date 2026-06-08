import Phaser from 'phaser';
import type { DragonState } from '@/types';

type GameEvents = {
  'coins:changed': number;
  'gems:changed': number;
  'resource:changed': { id: string; amount: number };
  'xp:changed': { xp: number; level: number };
  'dragon:added': DragonState;
  'book:discovered': string;
};

class TypedEventBus {
  private emitter = new Phaser.Events.EventEmitter();

  on<K extends keyof GameEvents>(
    event: K,
    handler: (payload: GameEvents[K]) => void,
    context?: unknown,
  ): void {
    this.emitter.on(event, handler, context);
  }

  off<K extends keyof GameEvents>(
    event: K,
    handler: (payload: GameEvents[K]) => void,
    context?: unknown,
  ): void {
    this.emitter.off(event, handler, context);
  }

  emit<K extends keyof GameEvents>(event: K, payload: GameEvents[K]): void {
    this.emitter.emit(event, payload);
  }
}

export const EventBus = new TypedEventBus();
