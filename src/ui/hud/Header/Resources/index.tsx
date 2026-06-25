import { useGameStore } from '@/store/useGameStore';
import Resource from './Resource';
import coinIcon from '@/assets/ui/icon_coin.png';
import gemIcon from '@/assets/ui/icon_gem.png';
import mapPartIcon from '@/assets/ui/icon_map-part.png';
import { RESOURCE_WIDTH } from './models';
import styles from './styles';

function Resources() {
  const coinsCount = useGameStore((s) => s.coins);
  const gemsCount = useGameStore((s) => s.gems);

  return (
    <div css={styles.resources}>
      <Resource iconSrc={coinIcon} count={coinsCount} width={RESOURCE_WIDTH.LG} name="Монеты" />
      <Resource iconSrc={gemIcon} count={gemsCount} name="Гемы" />
      <Resource iconSrc={mapPartIcon} count={1} name="Кусочки карты" />
    </div>
  );
}

export default Resources;
