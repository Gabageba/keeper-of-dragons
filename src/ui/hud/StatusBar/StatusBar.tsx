import { useGameStore } from '@store/useGameStore';
import coinIcon from '@/assets/icons/coin.png';
import gemIcon from '@/assets/icons/gem.png';
import Status from './Status';
import LevelStatus from './LevelStatus';
import styles from './styles';

function StatusBar() {
  const coins = useGameStore((s) => s.coins);
  const gems = useGameStore((s) => s.gems);
  const level = useGameStore((s) => s.player_level);
  const xp = useGameStore((s) => s.xp);

  return (
    <div css={styles.self}>
      <div>
        <LevelStatus level={level} xp={xp} />
      </div>
      <div css={styles.statusesContainer}>
        <Status img={gemIcon} name="Драгоценные камни" count={gems} />
        <Status img={coinIcon} name="Монеты" count={coins} />
      </div>
    </div>
  );
}

export default StatusBar;
