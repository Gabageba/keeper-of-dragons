import { css } from '@emotion/react';
import PhaserGame from '@game/PhaserGame';
import HUD from '@ui/hud/HUD';
import IslandUI from '@ui/island/IslandUI';
import Modals from '@ui/modals/Modals';
import DevMenu from '@ui/dev/DevMenu';
import { useUIStore } from '@store/useUIStore';
import GlobalStyles from './GlobalStyles';
import LoadingScreen from './LoadingScreen';
import useGameTick from './useGameTick';

const styles = {
  root: css`
    position: fixed;
    top: 0;
  `,
  gameHidden: css`
    visibility: hidden;
    pointer-events: none;
  `,
};

function App() {
  useGameTick();

  const gameReady = useUIStore((s) => s.gameReady);
  const devMenuOpen = useUIStore((s) => s.devMenuOpen);

  return (
    <>
      <div css={styles.root}>
        <GlobalStyles />
        <PhaserGame />
        <div css={gameReady ? undefined : styles.gameHidden}>
          <HUD />
          <IslandUI />
          <Modals />
        </div>
        {!gameReady && <LoadingScreen />}
        {import.meta.env.DEV && devMenuOpen && <DevMenu />}
      </div>
    </>
  );
}

export default App;
