import { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';

/**
 * Игровой тик: раз в секунду дёргает store.tick(), который обновляет таймеры в
 * срезах (правило 3 архитектуры — таймеры живут в Zustand, а не в Phaser).
 */
function useGameTick(): void {
  useEffect(() => {
    const id = window.setInterval(() => useGameStore.getState().tick(), 1000);
    return () => window.clearInterval(id);
  }, []);
}

export default useGameTick;
