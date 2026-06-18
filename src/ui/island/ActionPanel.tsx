import { css } from '@emotion/react';
import { useUIStore } from '@/store/useUIStore';
import { useGameStore } from '@/store/useGameStore';
import usePhaserBridge from '@/hooks/usePhaserBridge';
import PanelButton from './PanelButton';

const styles = {
  overlay: css`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(19, 16, 30, 0.97);
    border: 1px solid #4a3a6e;
    border-radius: 6px;
    padding: 16px 20px;
    z-index: 30;
    pointer-events: auto;
    font-family: serif;
    min-width: 260px;
    text-align: center;
  `,
  name: css`
    color: #d4cce8;
    font-size: 15px;
    margin-bottom: 14px;
  `,
  actions: css`
    display: flex;
    gap: 8px;
    justify-content: center;
  `,
};

function ActionPanel() {
  const actionPanel = useUIStore((s) => s.actionPanel);
  const bridge = usePhaserBridge();

  if (!actionPanel) return null;

  const { uid, name } = actionPanel;
  const close = () => useUIStore.getState().setActionPanel(null);

  const handleMove = () => {
    bridge.enterMoveMode(uid);
    close();
  };

  const handleDemolish = () => {
    useGameStore.getState().removeBuilding(uid);
    close();
  };

  return (
    <div css={styles.overlay}>
      <div css={styles.name}>{name}</div>
      <div css={styles.actions}>
        <PanelButton label="Переместить" onClick={handleMove} />
        <PanelButton label="Снести" onClick={handleDemolish} variant="danger" />
        <PanelButton label="Отмена" onClick={close} />
      </div>
    </div>
  );
}

export default ActionPanel;
