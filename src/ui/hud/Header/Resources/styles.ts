import { css } from '@emotion/react';
import resourceLarge from '@/assets/ui/resource-large.png';
import resourceSmall from '@/assets/ui/resource-small.png';

import token from '@/ui/shared/token';

const styles = {
  resources: css`
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  resource: css`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50px;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: center;
    ${token.accentText}
  `,
  smallResourceWidth: css`
    background-image: url(${resourceSmall});
    width: 143px;
  `,
  largeResourceWidth: css`
    width: 178px;
    background-image: url(${resourceLarge});
  `,
  resourceWrapper: css`
    border-radius: 18px;
    height: 36px;
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  smallResourceWrapper: css`
    width: 130px;
    padding: 3px;
  `,
  largeResourceWrapper: css`
    width: 166px;
    padding: 1px;
  `,
  resourceIcon: css`
    height: 100%;
    margin-left: 4px;
  `,
  resourceCount: css`
    flex: 1;
    text-align: center;
    margin-left: -8px;
  `,
};

export default styles;
