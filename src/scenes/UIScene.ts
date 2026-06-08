import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config';
import { Navigation } from '@/systems/Navigation';
import { EventBus } from '@/systems/EventBus';
import { GameState } from '@/systems/GameState';

export class UIScene extends Phaser.Scene {
  private statusText!: Phaser.GameObjects.Text;

  constructor() {
    super('UIScene');
  }

  create(): void {
    Navigation.init(this);

    this.add.rectangle(0, 0, GAME_WIDTH, 56, 0x13101e, 0.9).setOrigin(0, 0);

    this.statusText = this.add.text(20, 18, this.buildStatusText(), {
      fontFamily: 'serif',
      fontSize: '20px',
      color: '#d4cce8',
    });

    EventBus.on('coins:changed', this.onCoinsChanged, this);
    EventBus.on('gems:changed', this.onGemsChanged, this);
    EventBus.on('xp:changed', this.onXpChanged, this);

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown, this);

    this.add.rectangle(0, GAME_HEIGHT - 56, GAME_WIDTH, 56, 0x13101e, 0.9).setOrigin(0, 0);
    this.addMenuButton(GAME_WIDTH / 2 - 270, GAME_HEIGHT - 28, 'Книга', () => Navigation.openModal('BookScene'));
    this.addMenuButton(GAME_WIDTH / 2 - 90, GAME_HEIGHT - 28, 'Рынок', () => Navigation.openModal('MarketScene'));
    this.addMenuButton(GAME_WIDTH / 2 + 90, GAME_HEIGHT - 28, 'Скрещивание', () => Navigation.openModal('BreedingScene'));
    this.addMenuButton(GAME_WIDTH / 2 + 270, GAME_HEIGHT - 28, 'Карта', () => Navigation.gotoMap());
  }

  private buildStatusText(): string {
    return `🪙 ${GameState.coins}    💎 ${GameState.gems}    ✨ Ур. ${GameState.level}`;
  }

  private onCoinsChanged = (_coins: number): void => {
    this.statusText.setText(this.buildStatusText());
  };

  private onGemsChanged = (_gems: number): void => {
    this.statusText.setText(this.buildStatusText());
  };

  private onXpChanged = (_payload: { xp: number; level: number }): void => {
    this.statusText.setText(this.buildStatusText());
  };

  private onShutdown(): void {
    EventBus.off('coins:changed', this.onCoinsChanged, this);
    EventBus.off('gems:changed', this.onGemsChanged, this);
    EventBus.off('xp:changed', this.onXpChanged, this);
  }

  private addMenuButton(x: number, y: number, label: string, callback: () => void): void {
    const btn = this.add
      .text(x, y, label, {
        fontFamily: 'serif',
        fontSize: '20px',
        color: '#c9a84c',
      })
      .setOrigin(0.5)
      .setInteractive({ cursor: 'pointer' });

    btn.on('pointerup', callback);
    btn.on('pointerover', () => btn.setAlpha(0.65));
    btn.on('pointerout', () => btn.setAlpha(1));
  }
}
