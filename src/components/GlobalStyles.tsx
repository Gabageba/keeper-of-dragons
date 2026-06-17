import { css, Global } from '@emotion/react';
import ElMessiri from '@/assets/fonts/ElMessiri.ttf';

const styles = css`
  @font-face {
    font-family: 'ElMessiri';
    src: url(${ElMessiri}) format('truetype');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }

  html,
  body {
    font-family: 'Sofia Sans Semi Condensed', sans-serif;
    margin: 0;
    padding: 0;
    height: 100%;
    background: #0d0b14;
    overflow: hidden;
    overscroll-behavior: none;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
    font-family: inherit;
  }

  #root {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  canvas {
    display: block;
  }

  button {
    -webkit-tap-highlight-color: transparent;
  }
`;

function GlobalStyles() {
  return <Global styles={styles} />;
}

export default GlobalStyles;
