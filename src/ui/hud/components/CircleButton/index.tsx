import type { Interpolation, Theme } from '@emotion/react';
import styles from './styles';

type Props = {
  iconSrc: string;
  name: string;
  iconCss?: Interpolation<Theme>;
  onClick?: () => void;
};

function CircleButton({ iconSrc, name, iconCss, onClick }: Props) {
  return (
    <button css={styles.button} onClick={onClick}>
      <img src={iconSrc} alt={name} css={[styles.buttonIcon, iconCss]} />
    </button>
  );
}

export default CircleButton;
