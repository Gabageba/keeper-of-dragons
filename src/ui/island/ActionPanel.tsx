import { useState } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useGameStore } from '@/store/useGameStore';
import usePhaserBridge from '@/hooks/usePhaserBridge';

function ActionPanel() {
  const actionPanel = useUIStore((s) => s.actionPanel);
  const close = () => useUIStore.getState().setActionPanel(null);
  const bridge = usePhaserBridge();

  if (!actionPanel) return null;

  const { uid, name } = actionPanel;

  const handleMove = () => {
    bridge.enterMoveMode(uid);
    close();
  };

  const handleDemolish = () => {
    useGameStore.getState().removeBuilding(uid);
    close();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(19, 16, 30, 0.97)',
        border: '1px solid #4a3a6e',
        borderRadius: 6,
        padding: '16px 20px',
        zIndex: 30,
        pointerEvents: 'auto',
        fontFamily: 'serif',
        minWidth: 260,
        textAlign: 'center',
      }}
    >
      <div style={{ color: '#d4cce8', fontSize: 15, marginBottom: 14 }}>{name}</div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <PanelButton label="Переместить" onClick={handleMove} />
        <PanelButton label="Снести" onClick={handleDemolish} color="#ff6b6b" />
        <PanelButton label="Отмена" onClick={close} />
      </div>
    </div>
  );
}
export default ActionPanel;

function PanelButton({
  label,
  onClick,
  color = '#c9a84c',
}: {
  label: string;
  onClick: () => void;
  color?: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: 'serif',
        fontSize: 13,
        color,
        background: hovered ? '#3a2e60' : '#2a1e40',
        border: '1px solid #4a3a6e',
        borderRadius: 3,
        padding: '6px 12px',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}
