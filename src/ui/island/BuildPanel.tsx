import { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useUIStore } from '@/store/useUIStore';
import usePhaserBridge from '@/hooks/usePhaserBridge';
import ContentLoader from '@/systems/ContentLoader';

export default function BuildPanel() {
  const coins = useGameStore((s) => s.coins);
  const closeBuildPanel = useUIStore((s) => s.closeBuildPanel);
  const bridge = usePhaserBridge();
  const [hovered, setHovered] = useState<string | null>(null);

  const buildings = ContentLoader.allBuildings();

  const select = (id: string) => {
    bridge.enterBuildMode(id);
    closeBuildPanel();
  };

  const COLS = 2;
  const BTN_W = 190;
  const BTN_H = 56;
  const PAD = 8;
  const PANEL_W = COLS * (BTN_W + PAD) + PAD;

  return (
    <div
      style={{
        position: 'fixed',
        top: 112,
        right: 8,
        width: PANEL_W,
        background: 'rgba(19, 16, 30, 0.97)',
        border: '1px solid #4a3a6e',
        borderRadius: 4,
        padding: PAD,
        zIndex: 20,
        pointerEvents: 'auto',
        fontFamily: 'serif',
      }}
    >
      <div style={{ color: '#9a8ab8', fontSize: 14, marginBottom: PAD }}>Выберите постройку:</div>

      <div
        style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, ${BTN_W}px)`, gap: PAD }}
      >
        {buildings.map((def) => {
          const canAfford = coins >= def.cost;
          return (
            <button
              key={def.id}
              onClick={() => select(def.id)}
              onMouseEnter={() => setHovered(def.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                width: BTN_W,
                height: BTN_H,
                background: hovered === def.id ? '#3a2e60' : '#2a1e40',
                border: '1px solid #4a3a6e',
                borderRadius: 3,
                textAlign: 'left',
                padding: '6px 8px',
                cursor: 'pointer',
              }}
            >
              <div style={{ color: '#d4cce8', fontSize: 13 }}>{def.name}</div>
              <div
                style={{
                  color: canAfford ? '#9a8ab8' : '#ff6b6b',
                  fontSize: 11,
                  fontFamily: 'monospace',
                }}
              >
                {def.w}×{def.h}
                {'  '}🪙{def.cost}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
