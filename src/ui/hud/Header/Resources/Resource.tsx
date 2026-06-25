import { RESOURCE_WIDTH, type ResourceWidth } from './models';
import styles from './styles';

type Props = {
  iconSrc: string;
  count: number;
  name: string;
  width?: ResourceWidth;
};

function Resource({ iconSrc, count, name, width = RESOURCE_WIDTH.SM }: Props) {
  return (
    <div css={[styles.resource, styles[`${width}ResourceWidth`]]}>
      <div css={[styles.resourceWrapper, styles[`${width}ResourceWrapper`]]}>
        <img src={iconSrc} alt={name} css={styles.resourceIcon} />
        <span css={styles.resourceCount}>{count}</span>
      </div>
    </div>
  );
}

export default Resource;
