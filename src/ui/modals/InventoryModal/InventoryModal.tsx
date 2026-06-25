import { useUIStore } from '@store/useUIStore';
import { useGameStore } from '@store/useGameStore';
import { MODAL_KEY } from '@/types/modal';
import ModalShell from '../ModalShell/ModalShell';
import ResourceItem from './ResourceItem';
import styles from './styles';

function InventoryModal() {
  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const resources = useGameStore((s) => s.resources);

  if (activeModal !== MODAL_KEY.INVENTORY) return null;

  const entries = Object.entries(resources).filter(([, v]) => v > 0);

  return (
    <ModalShell onClose={closeModal}>
      {entries.length === 0 ? (
        <span css={styles.empty}>Инвентарь пуст</span>
      ) : (
        <div css={styles.grid}>
          {entries.map(([id, count]) => (
            <ResourceItem key={id} id={id} count={count} />
          ))}
        </div>
      )}
    </ModalShell>
  );
}

export default InventoryModal;
