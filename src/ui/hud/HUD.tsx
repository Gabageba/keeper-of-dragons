import { useUIStore } from '@store/useUIStore';
import StatusBar from './StatusBar/StatusBar';
import MenuBar from './MenuBar/MenuBar';
import OfflineSummary from './OfflineSummary';
import ResourceBar from './ResourceBar/ResourceBar';
import MessageToast from './MessageToast/MessageToast';

/** Постоянный игровой HUD: статус-бар, нижнее меню, оффлайн-сводка. */
function HUD() {
  const gameReady = useUIStore((s) => s.gameReady);
  if (!gameReady) return null;

  return (
    <>
      <StatusBar />
      <ResourceBar />
      <MenuBar />
      <OfflineSummary />
      <MessageToast />
    </>
  );
}
export default HUD;
