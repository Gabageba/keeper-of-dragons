import { useUIStore } from '@store/useUIStore';
import StatusBar from './StatusBar/StatusBar';
import MenuBar from './MenuBar/MenuBar';
import OfflineSummary from './OfflineSummary';

/** Постоянный игровой HUD: статус-бар, нижнее меню, оффлайн-сводка. */
function HUD() {
  const gameReady = useUIStore((s) => s.gameReady);
  if (!gameReady) return null;

  return (
    <>
      <StatusBar />
      <MenuBar />
      <OfflineSummary />
    </>
  );
}
export default HUD;
