import { GameState } from './GameState';

const INTERVAL_MS = 12_000;

export const AutoSave = {
  start(): void {
    setInterval(() => GameState.flush(), INTERVAL_MS);

    // Save when tab is hidden — critical on mobile where apps get suspended.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) GameState.flush();
    });

    // Save on window blur and before page unload.
    window.addEventListener('blur', () => GameState.flush());
    window.addEventListener('pagehide', () => GameState.flush());
  },
};
