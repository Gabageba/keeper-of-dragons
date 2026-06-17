import { useEffect, useRef } from 'react';
import { useUIStore } from '@/store/useUIStore';
import usePhaserBridge from '@/hooks/usePhaserBridge';

const BTN: React.CSSProperties = {
  width: 88,
  height: 30,
  fontFamily: 'serif',
  fontSize: 13,
  color: '#c9a84c',
  background: '#2a1e40',
  border: '1px solid #4a3a6e',
  cursor: 'pointer',
  padding: 0,
};

export default function GhostControls() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bridge = usePhaserBridge();

  // Позиция приходит из Phaser-сцены каждый кадр через useUIStore. Двигаем DOM
  // императивно, чтобы не дёргать React-рендер на каждом кадре.
  useEffect(() => {
    const apply = (pos: { x: number; y: number } | null) => {
      const el = containerRef.current;
      if (!el) return;
      if (!pos) {
        el.style.display = 'none';
      } else {
        el.style.left = `${pos.x}px`;
        el.style.top = `${pos.y}px`;
        el.style.display = 'flex';
      }
    };
    apply(useUIStore.getState().ghostControls);
    return useUIStore.subscribe((s) => apply(s.ghostControls));
  }, []);

  const hover = (e: React.MouseEvent<HTMLButtonElement>, on: boolean) => {
    const el = e.currentTarget;
    el.style.background = on ? '#3a2e60' : '#2a1e40';
  };

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', display: 'none', gap: 8, zIndex: 210, pointerEvents: 'auto' }}
    >
      <button
        style={BTN}
        onMouseOver={(e) => hover(e, true)}
        onMouseOut={(e) => hover(e, false)}
        onClick={bridge.ghostRotate}
      >
        ↻ Повернуть
      </button>
      <button
        style={BTN}
        onMouseOver={(e) => hover(e, true)}
        onMouseOut={(e) => hover(e, false)}
        onClick={bridge.ghostConfirm}
      >
        ✔ Готово
      </button>
      <button
        style={BTN}
        onMouseOver={(e) => hover(e, true)}
        onMouseOut={(e) => hover(e, false)}
        onClick={bridge.ghostCancel}
      >
        ✕ Отмена
      </button>
    </div>
  );
}
