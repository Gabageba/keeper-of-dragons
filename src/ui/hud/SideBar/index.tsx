import { useUIStore } from '@store/useUIStore';
import BuildPanel from '@/ui/island/BuildPanel';
import CircleButton from '../components/CircleButton';
import styles from './styles';
import usePhaserBridge from '@/ui/shared/hooks/usePhaserBridge';
import expeditionsIcon from '@/assets/ui/icon_expeditions.png';
import workshopIcon from '@/assets/ui/icon_workshop.png';
import questsIcon from '@/assets/ui/icon_quests.png';
import buildingIcon from '@/assets/ui/icon_building.png';
import coinIcon from '@/assets/ui/icon_coin.png';

function SideBar() {
  const toggleBuildPanel = useUIStore((s) => s.toggleBuildPanel);
  const buildPanelOpen = useUIStore((s) => s.buildPanelOpen);
  const bridge = usePhaserBridge();

  return (
    <div css={styles.sideBar}>
      {buildPanelOpen && <BuildPanel />}
      <CircleButton iconSrc={buildingIcon} name="Строительство" onClick={toggleBuildPanel} />
      <CircleButton iconSrc={coinIcon} name="Собрать всё" onClick={bridge.collectAllNests} />
      <CircleButton iconSrc={expeditionsIcon} name="Экспедиции" />
      <CircleButton iconSrc={workshopIcon} name="Мастерская" />
      <CircleButton iconSrc={questsIcon} name="Квесты" iconCss={styles.questsIcon} />
    </div>
  );
}

export default SideBar;
