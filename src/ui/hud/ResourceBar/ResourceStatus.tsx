import styles from './styles';

type Props = { id: string; count: number };

function ResourceStatus({ id, count }: Props) {
  return (
    <div css={styles.pill}>
      <span key={count} css={styles.count}>
        {count}
      </span>
      <span css={styles.label}>{id.replace(/_/g, ' ')}</span>
    </div>
  );
}

export default ResourceStatus;
