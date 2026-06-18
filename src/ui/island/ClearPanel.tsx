import { css } from '@emotion/react';
import { useUIStore } from '@/store/useUIStore';
import { useGameStore } from '@/store/useGameStore';
import PanelButton from './PanelButton';

const styles = {
  overlay: css`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 260px;
    background: rgba(19, 16, 30, 0.97);
    border: 1px solid #c9a84c;
    border-radius: 6px;
    padding: 16px 20px;
    z-index: 30;
    pointer-events: auto;
    font-family: serif;
    text-align: center;
  `,
  message: css`
    color: #d4cce8;
    font-size: 15px;
    margin-bottom: 16px;
  `,
  actions: css`
    display: flex;
    gap: 8px;
    justify-content: center;
  `,
};

function ClearPanel() {
  const clearPanel = useUIStore((s) => s.clearPanel);

  if (!clearPanel) return null;

  const { cx, cy, cost } = clearPanel;
  const close = () => useUIStore.getState().setClearPanel(null);

  const handleConfirm = () => {
    useGameStore.getState().clearCell(cx, cy, cost);
    close();
  };

  return (
    <div css={styles.overlay}>
      <div css={styles.message}>Расчистить за {cost} монет?</div>
      <div css={styles.actions}>
        <PanelButton label="Расчистить" onClick={handleConfirm} />
        <PanelButton label="Отмена" onClick={close} />
      </div>
    </div>
  );
}

export default ClearPanel;
