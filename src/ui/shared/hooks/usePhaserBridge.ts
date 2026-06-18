import { useMemo } from 'react';
import { getIslandScene, getGame } from '@game/gameRef';

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
