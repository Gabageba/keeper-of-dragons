import { useMemo } from 'react';
import { getIslandScene, getGame } from '@/phaser/gameRef';

/**
 * Команды React → Phaser (правило 1 архитектуры). Не мутируют игровое состояние
 * (это делают экшены стора), а управляют интеракцией сцены: режимы постройки/
 * перемещения, ghost-кнопки, переключение сцен. Сцена вызывается по ссылке из
 * gameRef, стор тут ни при чём.
 */
function usePhaserBridge() {
  return useMemo(
    () => ({
      enterBuildMode: (buildingId: string) => getIslandScene()?.enterBuildMode(buildingId),
      enterMoveMode: (uid: string) => getIslandScene()?.enterMoveMode(uid),
      ghostRotate: () => getIslandScene()?.ghostRotate(),
      ghostConfirm: () => getIslandScene()?.ghostConfirm(),
      ghostCancel: () => getIslandScene()?.ghostCancel(),
      showMap: () => {
        const game = getGame();
        if (!game) return;
        game.scene.sleep('IslandScene');
        game.scene.run('MapScene');
      },
      showIsland: () => {
        const game = getGame();
        if (!game) return;
        game.scene.stop('MapScene');
        game.scene.wake('IslandScene');
      },
    }),
    [],
  );
}

export default usePhaserBridge;
