import { MODAL_KEY } from '@/types/modal';
import PlaceholderModal from './PlaceholderModal';

function DragonBookModal() {
  return (
    <PlaceholderModal modal={MODAL_KEY.DRAGONS_BOOK} title="Книга Драконов" note="(task-13)" />
  );
}

export default DragonBookModal;
