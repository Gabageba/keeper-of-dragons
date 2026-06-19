import { useGameStore } from '@store/useGameStore';
import ResourceStatus from './ResourceStatus';
import styles from './styles';

function ResourceBar() {
  const resources = useGameStore((s) => s.resources);
  const entries = Object.entries(resources).filter(([, v]) => v > 0);
  if (entries.length === 0) return null;

  return (
    <div css={styles.bar}>
      {entries.map(([id, count]) => (
        <ResourceStatus key={id} id={id} count={count} />
      ))}
    </div>
  );
}

export default ResourceBar;
