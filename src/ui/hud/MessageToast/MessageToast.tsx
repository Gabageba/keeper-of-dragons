import { css } from '@emotion/react';
import { useUIStore } from '@store/useUIStore';

const styles = {
  toast: css`
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: #13101ecc;
    color: #ff6b6b;
    font-family: serif;
    font-size: 18px;
    padding: 4px 10px;
    border-radius: 4px;
    pointer-events: none;
    z-index: 50;
    white-space: nowrap;
  `,
};

function MessageToast() {
  const message = useUIStore((s) => s.toastMessage);
  if (!message) return null;

  return <div css={styles.toast}>{message}</div>;
}

export default MessageToast;
