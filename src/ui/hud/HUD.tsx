import { css } from '@emotion/react';
import OfflineSummary from './OfflineSummary';
import MessageToast from './MessageToast/MessageToast';
import NavBar from './NavBar';
import Header from './Header';
import SideBar from './SideBar';

const styles = {
  layout: css`
    position: fixed;
    inset: 0;
    display: grid;
    grid-template-rows: auto 1fr auto;
    grid-template-columns: 1fr auto;
    pointer-events: none;
    z-index: 10;
  `,
  header: css`
    grid-column: 1 / -1;
  `,
  sidebar: css`
    grid-row: 2;
    grid-column: 2;
  `,
  navbar: css`
    grid-column: 1 / -1;
  `,
};

/** Постоянный игровой HUD: статус-бар, нижнее меню, оффлайн-сводка. */
function HUD() {
  return (
    <div css={styles.layout}>
      <div css={styles.header}>
        <Header />
      </div>
      <div css={styles.sidebar}>
        <SideBar />
      </div>
      <div css={styles.navbar}>
        <NavBar />
      </div>

      <OfflineSummary />
      <MessageToast />
    </div>
  );
}
export default HUD;
