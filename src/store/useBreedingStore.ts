// Селектор-хуки домена скрещивания/инкубатора над корневым [[useGameStore]].
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from './useGameStore';

export const useBreeding = () => useGameStore((s) => s.breeding);
export const useIncubator = () => useGameStore((s) => s.incubator);

export const useBreedingActions = () =>
  useGameStore(
    useShallow((s) => ({
      startBreeding: s.startBreeding,
      collectBreeding: s.collectBreeding,
      addEgg: s.addEgg,
      hatchEgg: s.hatchEgg,
    })),
  );
