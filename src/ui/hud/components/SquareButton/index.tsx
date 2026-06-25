import type { Interpolation, Theme } from '@emotion/react';
import styles from './styles';

type Props = {
  iconSrc: string;
  name: string;
  onClick: VoidFunction;
  iconCss?: Interpolation<Theme>;
};

function SquareButton({ iconSrc, iconCss, name, onClick }: Props) {
  return (
    <button type="button" css={styles.button} onClick={onClick}>
      <img src={iconSrc} css={[styles.buttonIcon, iconCss]} alt={name} />
    </button>
  );
}

export default SquareButton;
