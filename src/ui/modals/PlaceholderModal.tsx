import { css } from '@emotion/react';
import { useUIStore } from '@store/useUIStore';
import type { ModalKey } from '@/types/modal';
import ModalShell from './ModalShell/ModalShell';

const styles = {
  title: css`
    color: #d4cce8;
    font-size: 36px;
    font-family: serif;
    text-align: center;
  `,
  note: css`
    font-size: 18px;
    color: #9a8ab8;
  `,
};

function PlaceholderModal({ modal, title, note }: { modal: ModalKey; title: string; note: string }) {
  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);

  if (activeModal !== modal) return null;

  return (
    <ModalShell onClose={closeModal}>
      <div css={styles.title}>
        {title}
        <br />
        <span css={styles.note}>{note}</span>
      </div>
    </ModalShell>
  );
}

export default PlaceholderModal;
