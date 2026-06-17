import { useState } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useGameStore } from '@/store/useGameStore';

export default function ClearPanel() {
  const clearPanel = useUIStore((s) => s.clearPanel);
  const close = () => useUIStore.getState().setClearPanel(null);

  if (!clearPanel) return null;

  const { cx, cy, cost } = clearPanel;

  const handleConfirm = () => {
    useGameStore.getState().clearCell(cx, cy, cost);
    close();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 260,
        background: 'rgba(19, 16, 30, 0.97)',
        border: '1px solid #c9a84c',
        borderRadius: 6,
        padding: '16px 20px',
        zIndex: 30,
        pointerEvents: 'auto',
        fontFamily: 'serif',
        textAlign: 'center',
      }}
    >
      <div style={{ color: '#d4cce8', fontSize: 15, marginBottom: 16 }}>
        Расчистить за {cost} монет?
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <PanelButton label="Расчистить" onClick={handleConfirm} />
        <PanelButton label="Отмена" onClick={close} />
      </div>
    </div>
  );
}

function PanelButton({ label, onClick }: { label: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: 'serif',
        fontSize: 13,
        color: '#c9a84c',
        background: hovered ? '#3a2e60' : '#2a1e40',
        border: '1px solid #4a3a6e',
        borderRadius: 3,
        padding: '6px 14px',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}
