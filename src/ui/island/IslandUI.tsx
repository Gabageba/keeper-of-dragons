import { useUIStore } from '@store/useUIStore';
import BuildPanel from './BuildPanel';
import ActionPanel from './ActionPanel';
import ClearPanel from './ClearPanel';
import GhostControls from './GhostControls';
import BuildToggle from './BuildToggle';

function IslandUI() {
  const gameReady = useUIStore((s) => s.gameReady);
  const buildPanelOpen = useUIStore((s) => s.buildPanelOpen);

  return (
    <>
      {gameReady && <BuildToggle />}
      {gameReady && buildPanelOpen && <BuildPanel />}
      <ActionPanel />
      <ClearPanel />
      <GhostControls />
    </>
  );
}

export default IslandUI;
