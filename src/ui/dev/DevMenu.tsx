import { css } from '@emotion/react';
import { useGameStore } from '@store/useGameStore';
import { useUIStore } from '@store/useUIStore';
import { GAME_SAVE_STORAGE_KEY } from '@/consts/storage';
import ContentLoader from '@game/systems/ContentLoader';
import { DRAGON_STAGE } from '@/types/dragon';
import { RENDER_MODE, CURRENT_RENDER_MODE, DEV_RENDER_MODE_LS_KEY } from '@/consts/renderMode';

const DEV_PANEL_WIDTH = 220;
const ONE_HOUR_MS = 3_600_000;

const styles = {
  panel: css`
    position: fixed;
    top: 56px;
    right: 0;
    width: ${DEV_PANEL_WIDTH}px;
    bottom: 56px;
    background: rgba(13, 11, 20, 0.97);
    border: 1px solid #3a2e5b;
    border-right: none;
    z-index: 20;
    pointer-events: auto;
    overflow-y: auto;
    font-family: monospace;
  `,
  header: css`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 8px 8px;
    position: relative;
  `,
  headerTitle: css`
    color: #ff6b6b;
    font-size: 13px;
  `,
  closeBtn: css`
    position: absolute;
    right: 8px;
    color: #7a6f99;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    font-family: monospace;
  `,
  divider: css`
    border-top: 1px solid #2e2845;
    margin: 6px 8px;
  `,
  sectionLabel: css`
    color: #4a3a6b;
    font-size: 10px;
    text-align: center;
    padding: 4px 0;
  `,
  btnWrapper: css`
    padding: 2px 8px;
  `,
  btn: css`
    width: 100%;
    background: #1e1a2e;
    border: none;
    border-radius: 3px;
    padding: 7px 8px;
    font-size: 11px;
    font-family: monospace;
    cursor: pointer;
    text-align: center;
    &:hover {
      background: #2e2845;
    }
  `,
  btnDefault: css`
    color: #d4cce8;
  `,
  btnWarning: css`
    color: #c9a84c;
  `,
  btnDanger: css`
    color: #ff4444;
  `,
  modeToggle: css`
    display: flex;
    gap: 4px;
    padding: 2px 8px;
  `,
  modeBtn: css`
    flex: 1;
    background: #1e1a2e;
    border: 1px solid #2e2845;
    border-radius: 3px;
    padding: 6px 4px;
    font-size: 11px;
    font-family: monospace;
    color: #4a3a6b;
    cursor: pointer;
    &:hover {
      background: #2e2845;
    }
  `,
  modeBtnActive: css`
    background: #2e2845;
    border-color: #7a6f99;
    color: #d4cce8;
  `,
};

const simulateOffline = (hours: number) => {
  const raw = localStorage.getItem(GAME_SAVE_STORAGE_KEY);
  if (!raw) return;
  const save = JSON.parse(raw) as { state: Record<string, unknown> };
  const state = save.state;
  const delta = hours * ONE_HOUR_MS;
  state.last_save = (state.last_save as number) - delta;
  for (const d of (state.dragons as { last_collected: number }[]) ?? []) {
    if (d.last_collected > 0) d.last_collected -= delta;
  }
  localStorage.setItem(GAME_SAVE_STORAGE_KEY, JSON.stringify(save));
  window.location.reload();
};

const completeAllTimers = () => {
  const raw = localStorage.getItem(GAME_SAVE_STORAGE_KEY);
  if (!raw) return;
  const save = JSON.parse(raw) as { state: Record<string, unknown> };
  const breeding = save.state.breeding as { active?: { ready_at: number } } | undefined;
  if (breeding?.active) breeding.active.ready_at = 0;
  for (const egg of (save.state.incubator as { ready_at: number }[]) ?? []) egg.ready_at = 0;
  localStorage.setItem(GAME_SAVE_STORAGE_KEY, JSON.stringify(save));
  window.location.reload();
};

function DevMenu() {
  const close = () => useUIStore.getState().toggleDevMenu();

  return (
    <div css={styles.panel}>
      <div css={styles.header}>
        <span css={styles.headerTitle}>⚙ DEV</span>
        <button onClick={close} css={styles.closeBtn}>
          ✕
        </button>
      </div>

      <div css={styles.divider} />

      <div css={styles.sectionLabel}>РЕСУРСЫ</div>
      <DevBtn label="+ 1000 монет" onClick={() => useGameStore.getState().addCoins(1000)} />
      <DevBtn label="+ 50 кристаллов" onClick={() => useGameStore.getState().addGems(50)} />
      <DevBtn label="+ 500 XP" onClick={() => useGameStore.getState().addXp(500)} />
      <DevBtn
        label="+ 100 всех ресурсов"
        onClick={() => {
          const ids = new Set(ContentLoader.allDragons().map((d) => d.resource));
          for (const id of ids) useGameStore.getState().addResource(id, 100);
        }}
      />

      <div css={styles.divider} />

      <div css={styles.sectionLabel}>ДРАКОНЫ</div>
      <DevBtn
        label="+ взрослый дракон"
        onClick={() => {
          const def = ContentLoader.allDragons()[0];
          if (!def) return;
          const store = useGameStore.getState();
          const dragonUid = `dev_${Date.now()}`;
          store.addDragon({
            uid: dragonUid,
            id: def.id,
            level: 1,
            stage: DRAGON_STAGE.ADULT,
            feedings: 10,
            last_collected: Date.now(),
          });
          store.discoverInBook(def.id);
          const islandId = store.currentIslandId;
          const freeNest = (store.placements[islandId] ?? []).find((p) => {
            const b = ContentLoader.building(p.buildingId);
            return b?.type === 'nest' && !p.refId;
          });
          if (freeNest) store.updatePlacementRef(freeNest.uid, dragonUid);
        }}
      />
      <DevBtn
        label="+ детёныш дракона"
        onClick={() => {
          const def = ContentLoader.allDragons()[0];
          if (!def) return;
          const store = useGameStore.getState();
          const dragonUid = `dev_${Date.now()}`;
          store.addDragon({
            uid: dragonUid,
            id: def.id,
            level: 1,
            stage: DRAGON_STAGE.BABY,
            feedings: 0,
            last_collected: Date.now(),
          });
          store.discoverInBook(def.id);
          const islandId = store.currentIslandId;
          const freeNest = (store.placements[islandId] ?? []).find((p) => {
            const b = ContentLoader.building(p.buildingId);
            return b?.type === 'nest' && !p.refId;
          });
          if (freeNest) store.updatePlacementRef(freeNest.uid, dragonUid);
        }}
      />

      <div css={styles.divider} />

      <div css={styles.sectionLabel}>СИМУЛЯЦИЯ</div>
      <DevBtn label="1ч оффлайн → reload" variant="warning" onClick={() => simulateOffline(1)} />
      <DevBtn label="12ч оффлайн → reload" variant="warning" onClick={() => simulateOffline(12)} />

      <DevBtn label="Завершить таймеры" variant="warning" onClick={completeAllTimers} />

      <div css={styles.divider} />

      <div css={styles.sectionLabel}>РЕНДЕР ДРАКОНОВ</div>
      <div css={styles.modeToggle}>
        {([RENDER_MODE.WIREFRAME, RENDER_MODE.TEXTURED] as const).map((mode) => (
          <button
            key={mode}
            css={[styles.modeBtn, CURRENT_RENDER_MODE === mode && styles.modeBtnActive]}
            onClick={() => {
              localStorage.setItem(DEV_RENDER_MODE_LS_KEY, mode);
              window.location.reload();
            }}
          >
            {mode === RENDER_MODE.WIREFRAME ? 'wireframe' : 'textured'}
          </button>
        ))}
      </div>

      <div css={styles.divider} />

      <DevBtn
        label="Сброс сохранения"
        variant="danger"
        onClick={() => {
          localStorage.removeItem(GAME_SAVE_STORAGE_KEY);
          window.location.reload();
        }}
      />
    </div>
  );
}

export default DevMenu;

function DevBtn({
  label,
  onClick,
  variant = 'default',
}: {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'warning' | 'danger';
}) {
  const variantStyle =
    variant === 'danger'
      ? styles.btnDanger
      : variant === 'warning'
        ? styles.btnWarning
        : styles.btnDefault;

  return (
    <div css={styles.btnWrapper}>
      <button onClick={onClick} css={[styles.btn, variantStyle]}>
        {label}
      </button>
    </div>
  );
}
