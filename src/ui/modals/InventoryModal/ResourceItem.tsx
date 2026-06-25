import styles from './styles';

type Props = { id: string; count: number };

function ResourceItem({ id, count }: Props) {
  return (
    <div css={styles.item}>
      <span key={count} css={styles.count}>
        {count}
      </span>
      <span css={styles.label}>{id.replace(/_/g, ' ')}</span>
    </div>
  );
}

export default ResourceItem;
