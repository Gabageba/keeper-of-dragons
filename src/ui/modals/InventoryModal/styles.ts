import { css, keyframes } from '@emotion/react';

const tickPop = keyframes`
  0%   { transform: scale(1);    color: #fff; }
  40%  { transform: scale(1.28); color: #ffe040; }
  100% { transform: scale(1);    color: #fff; }
`;

const styles = {
  grid: css`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    padding: 16px;
  `,
  empty: css`
    color: #9a8ab8;
    font-size: 18px;
    font-family: 'Nunito', sans-serif;
  `,
  item: css`
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(0, 0, 0, 0.35);
    padding: 6px 14px 6px 12px;
    border-radius: 14px;
    color: #fff;
    white-space: nowrap;
  `,
  count: css`
    font-family: 'Nunito', sans-serif;
    font-weight: 800;
    font-size: 22px;
    animation: ${tickPop} 0.45s ease-out;
    display: inline-block;
  `,
  label: css`
    font-family: 'Nunito', sans-serif;
    font-weight: 600;
    font-size: 14px;
    opacity: 0.75;
    text-transform: capitalize;
    letter-spacing: 0.02em;
  `,
};

export default styles;
