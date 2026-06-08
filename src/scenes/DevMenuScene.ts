import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config';
import { GameState } from '@/systems/GameState';
import { SaveManager } from '@/systems/SaveManager';
import { ContentLoader } from '@/systems/ContentLoader';

const PANEL_W = 220;
const TOP_BAR = 56;
const BOT_BAR = 56;

export class DevMenuScene extends Phaser.Scene {
  private readonly panelX = GAME_WIDTH - PANEL_W;
  private readonly panelH = GAME_HEIGHT - TOP_BAR - BOT_BAR;
  private readonly cx = this.panelX + PANEL_W / 2;

  constructor() {
    super('DevMenuScene');
  }

  create(): void {
    this.add
      .rectangle(this.cx, TOP_BAR + this.panelH / 2, PANEL_W, this.panelH, 0x0d0b14, 0.96)
      .setStrokeStyle(1, 0x3a2e5b)
      .setInteractive();

    let y = TOP_BAR + 16;

    this.add.text(this.cx - 12, y, '⚙ DEV', {
      fontFamily: 'monospace', fontSize: '13px', color: '#ff6b6b',
    }).setOrigin(0.5);

    const closeBtn = this.add
      .text(this.panelX + PANEL_W - 8, y, '✕', {
        fontFamily: 'monospace', fontSize: '14px', color: '#7a6f99',
      })
      .setOrigin(1, 0.5)
      .setInteractive({ cursor: 'pointer' });
    closeBtn.on('pointerup', () => this.scene.stop());
    closeBtn.on('pointerover', () => closeBtn.setColor('#d4cce8'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#7a6f99'));

    y += 22;
    this.hline(y); y += 10;

    // --- Ресурсы ---
    y = this.sectionLabel(y, 'РЕСУРСЫ');
    y = this.btn(y, '+ 1000 монет', () => {
      GameState.addCoins(1000);
      GameState.flush();
    });
    y = this.btn(y, '+ 50 кристаллов', () => {
      GameState.addGems(50);
      GameState.flush();
    });
    y = this.btn(y, '+ 500 XP', () => {
      GameState.addXp(500);
      GameState.flush();
    });
    y = this.btn(y, '+ 100 всех ресурсов', () => {
      const ids = new Set(ContentLoader.allDragons().map(d => d.resource));
      for (const id of ids) GameState.addResource(id, 100);
      GameState.flush();
    });

    y += 8; this.hline(y); y += 10;

    // --- Драконы ---
    y = this.sectionLabel(y, 'ДРАКОНЫ');
    y = this.btn(y, '+ взрослый дракон', () => {
      const def = ContentLoader.allDragons()[0];
      if (!def) return;
      GameState.addDragon({
        uid: `dev_${Date.now()}`,
        id: def.id,
        level: 1,
        stage: 'adult',
        feedings: 10,
        last_collected: Date.now(),
      });
      GameState.discoverInBook(def.id);
      GameState.flush();
    });

    y += 8; this.hline(y); y += 10;

    // --- Симуляция ---
    y = this.sectionLabel(y, 'СИМУЛЯЦИЯ');
    y = this.btn(y, '1ч оффлайн → reload', () => {
      GameState.flush();
      const raw = localStorage.getItem('dragons_save_v1');
      if (!raw) return;
      const data = JSON.parse(raw);
      data.last_save -= 3_600_000;
      for (const d of data.dragons ?? []) {
        if (d.last_collected > 0) d.last_collected -= 3_600_000;
      }
      localStorage.setItem('dragons_save_v1', JSON.stringify(data));
      window.location.reload();
    }, '#c9a84c');
    y = this.btn(y, 'Завершить таймеры', () => {
      GameState.flush();
      const raw = localStorage.getItem('dragons_save_v1');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.breeding?.active) data.breeding.active.ready_at = 0;
      for (const egg of data.incubator ?? []) egg.ready_at = 0;
      localStorage.setItem('dragons_save_v1', JSON.stringify(data));
      window.location.reload();
    }, '#c9a84c');

    y += 8; this.hline(y); y += 10;

    // --- Опасно ---
    this.btn(y, 'Сброс сохранения', () => {
      SaveManager.reset();
      window.location.reload();
    }, '#ff4444');
  }

  private sectionLabel(y: number, label: string): number {
    this.add.text(this.cx, y, label, {
      fontFamily: 'monospace', fontSize: '10px', color: '#4a3a6b',
    }).setOrigin(0.5);
    return y + 16;
  }

  private btn(y: number, label: string, callback: () => void, color = '#d4cce8'): number {
    const bg = this.add
      .rectangle(this.cx, y + 13, PANEL_W - 16, 26, 0x1e1a2e)
      .setInteractive({ cursor: 'pointer' });
    const text = this.add.text(this.cx, y + 13, label, {
      fontFamily: 'monospace', fontSize: '11px', color,
    }).setOrigin(0.5);

    bg.on('pointerup', callback);
    bg.on('pointerover', () => { bg.setFillStyle(0x2e2845); text.setAlpha(1); });
    bg.on('pointerout', () => { bg.setFillStyle(0x1e1a2e); });

    return y + 34;
  }

  private hline(y: number): void {
    const g = this.add.graphics();
    g.lineStyle(1, 0x2e2845);
    g.lineBetween(this.panelX + 8, y, this.panelX + PANEL_W - 8, y);
  }
}
