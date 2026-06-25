// Селектор-хуки домена садов над корневым [[useGameStore]].
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from './useGameStore';

export const useGardens = () => useGameStore((s) => s.gardens);

export const useGardenActions = () =>
  useGameStore(
    useShallow((s) => ({
      createGarden: s.createGarden,
      plantSeed: s.plantSeed,
      harvest: s.harvest,
      upgradeGarden: s.upgradeGarden,
      toggleAltar: s.toggleAltar,
    })),
  );
