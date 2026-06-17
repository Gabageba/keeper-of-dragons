// Селектор-хуки домена драконов над корневым [[useGameStore]].
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from './useGameStore';

export const useDragons = () => useGameStore((s) => s.dragons);

export const useDragonActions = () =>
  useGameStore(useShallow((s) => ({ addDragon: s.addDragon, collectResource: s.collectResource })));
