import { useUIStore, type ModalKey } from '@/store/useUIStore';
import ModalShell from './ModalShell';

/** Общий каркас модалки-заглушки: открывается по activeModal === modal. */
export default function PlaceholderModal({
  modal,
  title,
  note,
}: {
  modal: ModalKey;
  title: string;
  note: string;
}) {
  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);

  if (activeModal !== modal) return null;

  return (
    <ModalShell onClose={closeModal}>
      <div style={{ color: '#d4cce8', fontSize: 36, fontFamily: 'serif', textAlign: 'center' }}>
        {title}
        <br />
        <span style={{ fontSize: 18, color: '#9a8ab8' }}>{note}</span>
      </div>
    </ModalShell>
  );
}
