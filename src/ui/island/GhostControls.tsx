import { useEffect, useRef } from 'react';
import { css } from '@emotion/react';
import { useUIStore } from '@store/useUIStore';
import usePhaserBridge from '@/ui/shared/hooks/usePhaserBridge';

const styles = {
  container: css`
    position: fixed;
    display: none;
    gap: 8px;
    z-index: 210;
    pointer-events: auto;
  `,
  btn: css`
    width: 88px;
    height: 30px;
    font-family: serif;
    font-size: 13px;
    color: #c9a84c;
    background: #2a1e40;
    border: 1px solid #4a3a6e;
    cursor: pointer;
    padding: 0;
    &:hover {
      background: #3a2e60;
    }
  `,
};

function GhostControls() {
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

  return (
    <div ref={containerRef} css={styles.container}>
      <button css={styles.btn} onClick={bridge.ghostRotate}>
        ↻ Повернуть
      </button>
      <button css={styles.btn} onClick={bridge.ghostConfirm}>
        ✔ Готово
      </button>
      <button css={styles.btn} onClick={bridge.ghostCancel}>
        ✕ Отмена
      </button>
    </div>
  );
}

export default GhostControls;
