import { useEffect, useRef } from 'react';
import { css } from '@emotion/react';
import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import IslandScene from './scenes/IslandScene';
import MapScene from './scenes/MapScene';
import { setGame } from './gameRef';
import { createStoreBridge } from './bridge/createStorageBridge';

const PHASER_GAME_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: '#0d0b14',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: { pixelArt: false, antialias: true },
  scene: [BootScene, IslandScene, MapScene],
};

const styles = {
  container: css`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  `,
};

function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameRef.current || !containerRef.current) return;
    const game = new Phaser.Game({ ...PHASER_GAME_CONFIG, parent: containerRef.current });
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

  return <div ref={containerRef} css={styles.container} />;
}

export default PhaserGame;
