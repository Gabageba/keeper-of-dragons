import token from '@/models/token';
import { css } from '@emotion/react';

const styles = {
  self: css`
    position: fixed;
    display: flex;
    justify-content: space-between;
    top: 0;
    left: 0;
    width: 100%;
    padding-block: ${token.uiPaddingBlock};
    padding-inline: ${token.uiPaddingInline};
    align-items: center;
    z-index: 10;
    pointer-events: auto;
  `,
  countWrapper: css`
    font-size: ${token.uiFontSize};
    background-color: rgba(0, 0, 0, 0.25);
    color: #fff;
    font-weight: 400;
  `,
  countWrapperLeft: css`
    margin-right: -32px;
    padding-block: 4px;
    padding-right: 40px;
    padding-left: 24px;
    border-top-left-radius: ${token.uiBorderRadius};
    border-bottom-left-radius: ${token.uiBorderRadius};
  `,
  countWrapperRight: css`
    margin-left: -32px;
    padding-left: 40px;
    padding-right: 24px;
    padding-block: 4px;
    border-top-right-radius: ${token.uiBorderRadius};
    border-bottom-right-radius: ${token.uiBorderRadius};
  `,
  countWrapperLevel: css`
    width: 300px;
    /* border: 2px solid #e29720; */
  `,
  icon: css`
    width: ${token.statusImgSize};
    height: ${token.statusImgSize};
    z-index: 2;
  `,
  status: css`
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  statusesContainer: css`
    background-color: transparent;
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  levelIconWrapper: css`
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
  `,
  levelIcon: css`
    display: block;
    width: 100%;
    height: 100%;
  `,
  levelIconText: css`
    margin-top: 2px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-weight: 700;
    /* color: #f9e278; */
    color: #fff;
    /* font-size: ${token.uiFontSize}; */
    font-size: 28px;
    text-shadow:
      -1px -1px 0 #351b02,
      1px -1px 0 #351b02,
      -1px 1px 0 #351b02,
      1px 1px 0 #351b02;

    /* text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8); */
    pointer-events: none;
  `,
};

export default styles;
