import { css } from '@emotion/react';
import buttonCircle from '@/assets/ui/button-circle.png';

const styles = {
  button: css`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-image: url(${buttonCircle});
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: center;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  buttonIcon: css`
    width: 55px;
  `,
};

export default styles;
