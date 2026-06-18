import { css } from '@emotion/react';
import { useGameStore } from '@/store/useGameStore';
import { useUIStore } from '@/store/useUIStore';
import usePhaserBridge from '@/hooks/usePhaserBridge';
import ContentLoader from '@/systems/ContentLoader';

const COLS = 2;
const BTN_W = 190;
const BTN_H = 56;
const PAD = 8;
const PANEL_W = COLS * (BTN_W + PAD) + PAD;

const styles = {
  panel: css`
    position: fixed;
    top: 112px;
    right: 8px;
    width: ${PANEL_W}px;
    background: rgba(19, 16, 30, 0.97);
    border: 1px solid #4a3a6e;
    border-radius: 4px;
    padding: ${PAD}px;
    z-index: 20;
    pointer-events: auto;
    font-family: serif;
  `,
  title: css`
    color: #9a8ab8;
    font-size: 14px;
    margin-bottom: ${PAD}px;
  `,
  grid: css`
    display: grid;
    grid-template-columns: repeat(${COLS}, ${BTN_W}px);
    gap: ${PAD}px;
  `,
  btn: css`
    width: ${BTN_W}px;
    height: ${BTN_H}px;
    background: #2a1e40;
    border: 1px solid #4a3a6e;
    border-radius: 3px;
    text-align: left;
    padding: 6px 8px;
    cursor: pointer;
    &:hover {
      background: #3a2e60;
    }
  `,
  btnName: css`
    color: #d4cce8;
    font-size: 13px;
  `,
  btnInfo: css`
    font-size: 11px;
    font-family: monospace;
    color: #9a8ab8;
  `,
  btnInfoCantAfford: css`
    color: #ff6b6b;
  `,
};

function BuildPanel() {
  const coins = useGameStore((s) => s.coins);
  const closeBuildPanel = useUIStore((s) => s.closeBuildPanel);
  const bridge = usePhaserBridge();

  const buildings = ContentLoader.allBuildings();

  const select = (id: string) => {
    bridge.enterBuildMode(id);
    closeBuildPanel();
  };

  return (
    <div css={styles.panel}>
      <div css={styles.title}>Выберите постройку:</div>
      <div css={styles.grid}>
        {buildings.map((def) => {
          const canAfford = coins >= def.cost;
          return (
            <button key={def.id} onClick={() => select(def.id)} css={styles.btn}>
              <div css={styles.btnName}>{def.name}</div>
              <div css={[styles.btnInfo, !canAfford && styles.btnInfoCantAfford]}>
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

export default BuildPanel;
