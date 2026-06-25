import token from '@/ui/shared/token';
import { css } from '@emotion/react';

const styles = {
  header: css`
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding-block: ${token.uiPaddingBlock};
    padding-inline: ${token.uiPaddingInline};
    align-items: start;
    pointer-events: auto;
  `,
  content: css`
    margin-top: 14px;
  `,
};

export default styles;
