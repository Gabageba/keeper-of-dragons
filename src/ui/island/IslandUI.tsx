import { useState } from 'react';
import { useUIStore } from '@/store/useUIStore';
import BuildPanel from './BuildPanel';
import ActionPanel from './ActionPanel';
import ClearPanel from './ClearPanel';
import GhostControls from './GhostControls';

/** Оверлей поверх canvas для интеракций с островом: стройка, панели, ghost-кнопки. */
export default function IslandUI() {
  const gameReady = useUIStore((s) => s.gameReady);
  const buildPanelOpen = useUIStore((s) => s.buildPanelOpen);
  const toggleBuildPanel = useUIStore((s) => s.toggleBuildPanel);

  return (
    <>
      {gameReady && <BuildToggle open={buildPanelOpen} onToggle={toggleBuildPanel} />}
      {gameReady && buildPanelOpen && <BuildPanel />}
      <ActionPanel />
      <ClearPanel />
      <GhostControls />
    </>
  );
}

function BuildToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'fixed',
        top: 70,
        right: 8,
        zIndex: 21,
        fontFamily: 'serif',
        fontSize: 16,
        color: '#c9a84c',
        background: open || hovered ? 'rgba(58,46,96,0.95)' : 'rgba(19,16,30,0.9)',
        border: '1px solid #4a3a6e',
        borderRadius: 4,
        padding: '6px 12px',
        cursor: 'pointer',
        pointerEvents: 'auto',
      }}
    >
      🔨 Построить
    </button>
  );
}
