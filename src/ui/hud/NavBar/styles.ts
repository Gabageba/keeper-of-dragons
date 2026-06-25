import { css } from '@emotion/react';

const styles = {
  navBar: css`
    width: 100%;
    height: 100px;
    margin-block: 12px;
    pointer-events: auto;
  `,
  navBarContainer: css`
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
  `,
  // wood: css`
  //   position: absolute;
  //   bottom: 0;
  //   /* background-color: ${token.woodColor}; */
  //   /* border-top: 4px solid ${token.goldColor}; */
  //   width: 100%;
  //   height: 80px;
  //   z-index: 1;
  // `,
  buttonsContainer: css`
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 30px;
    flex: 1;
  `,
  dragonsBookIcon: css`
    height: 64px;
    margin-top: 3px;
  `,
  shopIcon: css`
    height: 60px;
  `,
  ordersIcon: css`
    height: 61px;
  `,
  mapIcon: css`
    height: 60px;
  `,
  inventoryIcon: css`
    height: 63px;
    margin-top: -3px;
  `,
};

export default styles;
