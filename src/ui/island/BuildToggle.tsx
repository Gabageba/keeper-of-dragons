import { css } from '@emotion/react';
import { useUIStore } from '@store/useUIStore';

const styles = {
  btn: css`
    position: fixed;
    top: 70px;
    right: 8px;
    z-index: 21;
    font-family: serif;
    font-size: 16px;
    color: #c9a84c;
    background: rgba(19, 16, 30, 0.9);
    border: 1px solid #4a3a6e;
    border-radius: 4px;
    padding: 6px 12px;
    cursor: pointer;
    pointer-events: auto;
    &:hover,
    &[data-open='true'] {
      background: rgba(58, 46, 96, 0.95);
    }
  `,
};

function BuildToggle() {
  const open = useUIStore((s) => s.buildPanelOpen);
  const toggle = useUIStore((s) => s.toggleBuildPanel);

  return (
    <button css={styles.btn} data-open={String(open)} onClick={toggle}>
      🔨 Построить
    </button>
  );
}

export default BuildToggle;
