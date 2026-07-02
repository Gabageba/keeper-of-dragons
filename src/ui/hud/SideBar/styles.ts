import { css } from '@emotion/react';
import token from '@/ui/shared/token';

const styles = {
  sideBar: css`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: ${token.uiPaddingBlock} ${token.uiPaddingInline};
    pointer-events: auto;
    height: 100%;
    justify-content: center;
  `,
  questsIcon: css`
    height: 51px;
    width: auto;
  `,
};

export default styles;
