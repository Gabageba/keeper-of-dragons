import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config';
import BootScene from './scenes/BootScene';
import IslandScene from './scenes/IslandScene';
import MapScene from './scenes/MapScene';
import { createStoreBridge } from './bridge/storeBridge';
import { setGame } from './gameRef';

const phaserConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: '#0d0b14',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  render: { pixelArt: false, antialias: true },
  scene: [BootScene, IslandScene, MapScene],
};

/**
 * PhaserGame — монтирует canvas и создаёт Phaser.Game. Мост (storeBridge) кладёт
 * в registry колбэки стора и подписывается на изменения для синка визуала.
 * Сам Phaser стор не импортирует (правило 5 архитектуры).
 */
function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameRef.current || !containerRef.current) return;
    const game = new Phaser.Game({ ...phaserConfig, parent: containerRef.current });
    gameRef.current = game;
    setGame(game);
    const disposeBridge = createStoreBridge(game);

    return () => {
      disposeBridge();
      game.destroy(true);
      gameRef.current = null;
      setGame(null);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
    />
  );
}

export default PhaserGame;
