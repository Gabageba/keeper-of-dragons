import { useUIStore, type ModalKey } from '@/store/useUIStore';
import usePhaserBridge from '@/hooks/usePhaserBridge';
import styles from './styles';

const MENU_ITEMS: { label: string; modal: ModalKey }[] = [
  { label: 'Книга', modal: 'book' },
  { label: 'Заказы', modal: 'orders' },
  { label: 'Скрещивание', modal: 'breeding' },
  { label: 'Инвентарь', modal: 'inventory' },
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

function MenuButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} css={styles.menuButton}>
      {label}
    </button>
  );
}
