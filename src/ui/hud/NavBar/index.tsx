import { useUIStore } from '@/store/useUIStore';
import styles from './styles';
import usePhaserBridge from '@/ui/shared/hooks/usePhaserBridge';
import { MODAL_KEY } from '@/types/modal';
import dragonsBookIcon from '@/assets/ui/icon_dragons-book.png';
import breedingIcon from '@/assets/ui/icon_breeding.png';
import shopIcon from '@/assets/ui/icon_shop.png';
import ordersIcon from '@/assets/ui/icon_orders.png';
import mapIcon from '@/assets/ui/icon_map.png';
import inventoryIcon from '@/assets/ui/icon_inventory.png';
import devIcon from '@/assets/ui/icon_dev.png';
import SquareButton from '../components/SquareButton';

function NavBar() {
  const openModal = useUIStore((s) => s.openModal);
  const toggleDevMenu = useUIStore((s) => s.toggleDevMenu);
  const bridge = usePhaserBridge();

  return (
    <div css={styles.navBar}>
      <div css={styles.navBarContainer}>
        <div css={styles.buttonsContainer}>
          <SquareButton
            name="Магазин"
            iconSrc={shopIcon}
            iconCss={styles.shopIcon}
            onClick={() => openModal(MODAL_KEY.SHOP)}
          />
          <SquareButton
            name="Скрещивание"
            iconSrc={breedingIcon}
            onClick={() => openModal(MODAL_KEY.BREEDING)}
          />
          <SquareButton
            name="Книга драконов"
            iconSrc={dragonsBookIcon}
            iconCss={styles.dragonsBookIcon}
            onClick={() => openModal(MODAL_KEY.DRAGONS_BOOK)}
          />
          <SquareButton
            name="Заказы"
            iconSrc={ordersIcon}
            iconCss={styles.ordersIcon}
            onClick={() => openModal(MODAL_KEY.ORDERS)}
          />
          <SquareButton
            name="Инвентарь"
            iconSrc={inventoryIcon}
            iconCss={styles.inventoryIcon}
            onClick={() => openModal(MODAL_KEY.INVENTORY)}
          />
          <SquareButton
            name="Карта"
            iconSrc={mapIcon}
            iconCss={styles.mapIcon}
            onClick={bridge.showMap}
          />
          {import.meta.env.DEV && (
            <SquareButton name="Дев меню" iconSrc={devIcon} onClick={toggleDevMenu} />
          )}
        </div>
      </div>
    </div>
  );
}

export default NavBar;
