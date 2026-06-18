import { type ReactNode, useState } from 'react';
import { css } from '@emotion/react';
import Background from '@/assets/ui/modal.png';

interface Props {
  onClose: () => void;
  children: ReactNode;
}

const styles = {
  overlay: css`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 40;
    pointer-events: auto;
  `,
  modal: css`
    border: 1px solid #4a3a6e;
    border-radius: 8px;
    padding: 40px 60px;

    //TODO: fix it
    max-width: 90%;
    aspect-ratio: 16/9;
    height: 90%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background-image: url(${Background});
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: center;
  `,
  closeButton: (hovered: boolean) => css`
    position: absolute;
    top: 12px;
    right: 16px;
    font-family: serif;
    font-size: 24px;
    color: ${hovered ? '#d4cce8' : '#c9a84c'};
    background: none;
    border: none;
    cursor: pointer;
    line-height: 1;
  `,
};

function ModalShell({ onClose, children }: Props) {
  const [closeHovered, setCloseHovered] = useState(false);

  return (
    <div onClick={onClose} css={styles.overlay}>
      <div onClick={(e) => e.stopPropagation()} css={styles.modal}>
        <button
          onClick={onClose}
          onMouseEnter={() => setCloseHovered(true)}
          onMouseLeave={() => setCloseHovered(false)}
          css={styles.closeButton(closeHovered)}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

export default ModalShell;
