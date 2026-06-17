import { css } from '@emotion/react';

const styles = {
  menuBar: css`
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 56px;
    background: rgba(19, 16, 30, 0.93);
    border-top: 1px solid #2e2845;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 60px;
    z-index: 10;
    pointer-events: auto;
  `,
  devButton: css`
    position: absolute;
    right: 12px;
    font-family: monospace;
    font-size: 13px;
    color: #ff6b6b;
    background: none;
    border: none;
    cursor: pointer;
  `,
  menuButton: css`
    font-size: 20px;
    color: #c9a84c;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    &:hover {
      opacity: 0.65;
    }
  `,
};

export default styles;
