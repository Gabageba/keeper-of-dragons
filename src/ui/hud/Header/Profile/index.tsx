import { useGameStore } from '@/store/useGameStore';
import styles from './styles';
import { xpForLevel } from '@/store/slices/gameSlice';

function Profile() {
  const level = useGameStore((s) => s.player_level);
  const xp = useGameStore((s) => s.xp);

  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const span = next - base;
  const pct = span > 0 ? Math.min(100, Math.max(0, ((xp - base) / span) * 100)) : 0;

  return (
    <div css={styles.profile}>
      <div css={styles.level}>Ур. {level}</div>
      <div css={styles.progressTrack}>
        <div css={styles.progressFill(pct)} />
      </div>
      <div css={styles.avatar} />
    </div>
  );
}

export default Profile;
