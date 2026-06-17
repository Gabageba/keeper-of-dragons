// Селектор-хуки домена острова над корневым [[useGameStore]].
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from './useGameStore';

export const useCurrentIslandId = () => useGameStore((s) => s.currentIslandId);

export const useCurrentPlacements = () =>
  useGameStore((s) => s.placements[s.currentIslandId] ?? []);

export const useIslandActions = () =>
  useGameStore(
    useShallow((s) => ({
      setCurrentIsland: s.setCurrentIsland,
      placeBuilding: s.placeBuilding,
      moveBuilding: s.moveBuilding,
      removeBuilding: s.removeBuilding,
      clearCell: s.clearCell,
    })),
  );
