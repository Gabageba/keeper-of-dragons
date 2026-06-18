import levelIcon from '@/assets/icons/level.png';
import { xpForLevel } from '@store/slices/gameSlice';
import styles from './styles';

type Props = {
  level: number;
  xp: number;
};

function LevelStatus({ level, xp }: Props) {
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const into = xp - base;
  const span = next - base;

  return (
    <div css={styles.status}>
      <div css={styles.levelIconWrapper}>
        <img src={levelIcon} css={styles.levelIcon} alt="Level" />
        <span css={styles.levelIconText}>{level}</span>
      </div>

      <span css={[styles.countWrapper, styles.countWrapperRight, styles.countWrapperLevel]}>
        XP: {into}/{span}
      </span>
    </div>
  );
}

export default LevelStatus;
