import { useState } from 'react';
import { useGameStore, STORE_KEY } from '@/store/useGameStore';
import { useUIStore } from '@/store/useUIStore';
import ContentLoader from '@/systems/ContentLoader';

const PANEL_W = 220;
const HOUR_MS = 3_600_000;

/** Сдвигает таймеры в персисте на час назад и перезагружает — имитация оффлайна. */
function simulateOfflineHour(): void {
  const raw = localStorage.getItem(STORE_KEY);
  if (!raw) return;
  const save = JSON.parse(raw) as { state: Record<string, unknown> };
  const state = save.state;
  state.last_save = (state.last_save as number) - HOUR_MS;
  for (const d of (state.dragons as { last_collected: number }[]) ?? []) {
    if (d.last_collected > 0) d.last_collected -= HOUR_MS;
  }
  localStorage.setItem(STORE_KEY, JSON.stringify(save));
  window.location.reload();
}

/** Обнуляет ready_at у скрещивания и яиц — таймеры завершены. */
function completeTimers(): void {
  const raw = localStorage.getItem(STORE_KEY);
  if (!raw) return;
  const save = JSON.parse(raw) as { state: Record<string, unknown> };
  const breeding = save.state.breeding as { active?: { ready_at: number } } | undefined;
  if (breeding?.active) breeding.active.ready_at = 0;
  for (const egg of (save.state.incubator as { ready_at: number }[]) ?? []) egg.ready_at = 0;
  localStorage.setItem(STORE_KEY, JSON.stringify(save));
  window.location.reload();
}

export default function DevMenu() {
  const close = () => useUIStore.getState().toggleDevMenu();

  return (
    <div
      style={{
        position: 'fixed',
        top: 56,
        right: 0,
        width: PANEL_W,
        bottom: 56,
        background: 'rgba(13, 11, 20, 0.97)',
        border: '1px solid #3a2e5b',
        borderRight: 'none',
        zIndex: 20,
        pointerEvents: 'auto',
        overflowY: 'auto',
        fontFamily: 'monospace',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 8px 8px',
          position: 'relative',
        }}
      >
        <span style={{ color: '#ff6b6b', fontSize: 13 }}>⚙ DEV</span>
        <button
          onClick={close}
          style={{
            position: 'absolute',
            right: 8,
            color: '#7a6f99',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            fontFamily: 'monospace',
          }}
        >
          ✕
        </button>
      </div>

      <Divider />

      <Section label="РЕСУРСЫ" />
      <DevBtn label="+ 1000 монет" onClick={() => useGameStore.getState().addCoins(1000)} />
      <DevBtn label="+ 50 кристаллов" onClick={() => useGameStore.getState().addGems(50)} />
      <DevBtn label="+ 500 XP" onClick={() => useGameStore.getState().addXp(500)} />
      <DevBtn
        label="+ 100 всех ресурсов"
        onClick={() => {
          const ids = new Set(ContentLoader.allDragons().map((d) => d.resource));
          for (const id of ids) useGameStore.getState().addResource(id, 100);
        }}
      />

      <Divider />

      <Section label="ДРАКОНЫ" />
      <DevBtn
        label="+ взрослый дракон"
        onClick={() => {
          const def = ContentLoader.allDragons()[0];
          if (!def) return;
          useGameStore.getState().addDragon({
            uid: `dev_${Date.now()}`,
            id: def.id,
            level: 1,
            stage: 'adult',
            feedings: 10,
            last_collected: Date.now(),
          });
          useGameStore.getState().discoverInBook(def.id);
        }}
      />

      <Divider />

      <Section label="СИМУЛЯЦИЯ" />
      <DevBtn label="1ч оффлайн → reload" color="#c9a84c" onClick={simulateOfflineHour} />
      <DevBtn label="Завершить таймеры" color="#c9a84c" onClick={completeTimers} />

      <Divider />

      <DevBtn
        label="Сброс сохранения"
        color="#ff4444"
        onClick={() => {
          localStorage.removeItem(STORE_KEY);
          window.location.reload();
        }}
      />
    </div>
  );
}

function Section({ label }: { label: string }) {
  return (
    <div style={{ color: '#4a3a6b', fontSize: 10, textAlign: 'center', padding: '4px 0' }}>
      {label}
    </div>
  );
}

function Divider() {
  return <div style={{ borderTop: '1px solid #2e2845', margin: '6px 8px' }} />;
}

function DevBtn({
  label,
  onClick,
  color = '#d4cce8',
}: {
  label: string;
  onClick: () => void;
  color?: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ padding: '2px 8px' }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: '100%',
          background: hovered ? '#2e2845' : '#1e1a2e',
          border: 'none',
          borderRadius: 3,
          padding: '7px 8px',
          color,
          fontSize: 11,
          fontFamily: 'monospace',
          cursor: 'pointer',
          textAlign: 'center',
        }}
      >
        {label}
      </button>
    </div>
  );
}
