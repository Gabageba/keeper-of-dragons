import { css, keyframes } from '@emotion/react';

const tickPop = keyframes`
  0%   { transform: scale(1);    color: #fff; }
  40%  { transform: scale(1.28); color: #ffe040; }
  100% { transform: scale(1);    color: #fff; }
`;

const styles = {
  bar: css`
    position: fixed;
    top: 76px;
    left: 16px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    pointer-events: none;
    z-index: 10;
  `,
  pill: css`
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(0, 0, 0, 0.35);
    padding: 3px 10px 3px 8px;
    border-radius: 12px;
    font-size: 13px;
    color: #fff;
    white-space: nowrap;
  `,
  count: css`
    font-weight: 600;
    animation: ${tickPop} 0.45s ease-out;
    display: inline-block;
  `,
  label: css`
    opacity: 0.75;
    font-size: 11px;
    text-transform: capitalize;
    letter-spacing: 0.02em;
  `,
};

export default styles;
