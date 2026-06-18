import { css } from '@emotion/react';
import PhaserGame from '@game/PhaserGame';
import HUD from '@ui/hud/HUD';
import IslandUI from '@ui/island/IslandUI';
import Modals from '@ui/modals/Modals';
import DevMenu from '@ui/dev/DevMenu';
import { useUIStore } from '@store/useUIStore';
import GlobalStyles from './GlobalStyles';
import useGameTick from './useGameTick';

const styles = {
  root: css`
    position: fixed;
    top: 0;
  `,
};

function App() {
  useGameTick();

  const devMenuOpen = useUIStore((s) => s.devMenuOpen);

  return (
    <>
      <div css={styles.root}>
        <GlobalStyles />
        <PhaserGame />
        <HUD />
        <IslandUI />
        <Modals />
        {import.meta.env.DEV && devMenuOpen && <DevMenu />}
      </div>
    </>
  );
}

export default App;
