import { useEffect, useRef } from 'react';
import { css } from '@emotion/react';
import { useUIStore } from '@store/useUIStore';
import { useGameStore } from '@store/useGameStore';
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
  btnDanger: css`
    color: #e05050;
    border-color: #6e3a3a;
    &:hover {
      background: #3e1a1a;
    }
  `,
};

function GhostControls() {
  const containerRef = useRef<HTMLDivElement>(null);
  const movingUidRef = useRef<string | undefined>(undefined);
  const bridge = usePhaserBridge();
  const removeBuilding = useGameStore((s) => s.removeBuilding);

  useEffect(() => {
    const apply = (pos: { x: number; y: number; movingUid?: string } | null) => {
      const el = containerRef.current;
      if (!el) return;
      movingUidRef.current = pos?.movingUid;
      if (!pos) {
        el.style.display = 'none';
      } else {
        el.style.left = `${pos.x}px`;
        el.style.top = `${pos.y}px`;
        el.style.display = 'flex';
        const demolishBtn = el.querySelector<HTMLButtonElement>('[data-demolish]');
        if (demolishBtn) demolishBtn.style.display = pos.movingUid ? '' : 'none';
      }
    };
    apply(useUIStore.getState().ghostControls);
    return useUIStore.subscribe((s) => apply(s.ghostControls));
  }, []);

  const handleDemolish = () => {
    const uid = movingUidRef.current;
    bridge.ghostCancel();
    if (uid) removeBuilding(uid);
  };

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
      <button data-demolish css={[styles.btn, styles.btnDanger]} onClick={handleDemolish}>
        🗑 Снести
      </button>
    </div>
  );
}

export default GhostControls;
