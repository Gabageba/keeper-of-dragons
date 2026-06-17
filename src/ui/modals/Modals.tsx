import DragonBookModal from './DragonBookModal';
import BreedingModal from './BreedingModal';
import OrdersModal from './OrdersModal';
import InventoryModal from './InventoryModal';

/** Все модалки поверх canvas. Каждая сама решает, показываться ли по activeModal. */
export default function Modals() {
  return (
    <>
      <DragonBookModal />
      <BreedingModal />
      <OrdersModal />
      <InventoryModal />
    </>
  );
}
