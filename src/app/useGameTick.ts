import { useEffect } from 'react';
import { useGameStore } from '@store/useGameStore';

function useGameTick(): void {
  useEffect(() => {
    const id = window.setInterval(() => useGameStore.getState().tick(), 1000);
    return () => window.clearInterval(id);
  }, []);
}

export default useGameTick;
