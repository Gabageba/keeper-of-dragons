import styles from './styles';

type Props = {
  img: string;
  name: string;
  count: number;
};

function Status({ img, name, count }: Props) {
  return (
    <div css={styles.status}>
      <span css={[styles.countWrapper, styles.countWrapperLeft]}>{count}</span>
      <img src={img} alt={name} css={styles.icon} />
    </div>
  );
}

export default Status;
