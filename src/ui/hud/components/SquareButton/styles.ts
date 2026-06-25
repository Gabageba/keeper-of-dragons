import { css } from '@emotion/react';
import button from '@/assets/ui/button-square.png';

const styles = {
  button: css`
    width: 100px;
    height: 100px;
    z-index: 2;
    background-image: url(${button});
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: center;
    border-radius: 28px;
    background-color: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:focus {
      outline: none;
    }
  `,
  buttonIcon: css`
    height: 58px;
  `,
};

export default styles;
