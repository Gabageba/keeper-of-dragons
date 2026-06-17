import PhaserGame from '@/phaser/PhaserGame';
import HUD from '@/ui/hud/HUD';
import IslandUI from '@/ui/island/IslandUI';
import Modals from '@/ui/modals/Modals';
import DevMenu from '@/ui/DevMenu';
import { useUIStore } from '@/store/useUIStore';
import GlobalStyles from './components/GlobalStyles';
import useGameTick from './hooks/useGameTick';
import { css } from '@emotion/react';

const styles = {
  self: css`
    position: 'fixed';
    top: 0;
  `,
};

function App() {
  useGameTick();

  const devMenuOpen = useUIStore((s) => s.devMenuOpen);

  return (
    <>
      <div css={styles.self}>
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
