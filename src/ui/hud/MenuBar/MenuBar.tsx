import { useUIStore } from '@store/useUIStore';
import { MODAL_KEY, type ModalKey } from '@/types/modal';
import usePhaserBridge from '@/ui/shared/hooks/usePhaserBridge';
import styles from './styles';
import MenuButton from './MenuButton';

const MENU_ITEMS: { label: string; modal: ModalKey }[] = [
  { label: 'Книга', modal: MODAL_KEY.BOOK },
  { label: 'Заказы', modal: MODAL_KEY.ORDERS },
  { label: 'Скрещивание', modal: MODAL_KEY.BREEDING },
  { label: 'Инвентарь', modal: MODAL_KEY.BREEDING },
];

function MenuBar() {
  const openModal = useUIStore((s) => s.openModal);
  const toggleDevMenu = useUIStore((s) => s.toggleDevMenu);
  const bridge = usePhaserBridge();

  return (
    <div css={styles.menuBar}>
      {MENU_ITEMS.map(({ label, modal }) => (
        <MenuButton key={modal} label={label} onClick={() => openModal(modal)} />
      ))}
      <MenuButton label="Карта" onClick={bridge.showMap} />
      {import.meta.env.DEV && (
        <button onClick={toggleDevMenu} css={styles.devButton}>
          [DEV]
        </button>
      )}
    </div>
  );
}

export default MenuBar;
