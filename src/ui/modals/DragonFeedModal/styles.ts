import { css } from '@emotion/react';

export const styles = {
  root: css`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    gap: 20px;
    color: #d4cce8;
    font-family: 'Nunito', sans-serif;
    overflow: hidden;
  `,

  // ─── левая колонка ──────────────────────────────────────────────────────────

  leftCol: css`
    display: flex;
    flex-direction: column;
    width: 320px;
    flex-shrink: 0;
  `,

  dragonImageBox: css`
    width: 100%;
    height: 100%;
    border-radius: 12px;
    overflow: hidden;
    background: rgba(20, 14, 36, 0.5);
    border: 1px solid #4a3a6e;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      border-color 0.15s,
      background 0.15s;
  `,

  dragonImageBoxDragOver: css`
    border-color: #60d090;
    background: rgba(40, 120, 70, 0.3);
    box-shadow: inset 0 0 0 2px rgba(96, 208, 144, 0.35);
  `,

  dragonImage: css`
    width: 100%;
    height: 100%;
    object-fit: contain;
  `,

  dragonImagePlaceholder: (color: string) => css`
    width: 100%;
    height: 100%;
    background: ${color}33;
  `,

  dragonMeta: css`
    display: flex;
    flex-direction: column;
    gap: 6px;
  `,

  dragonName: css`
    font-family: 'Balsamiq Sans', cursive;
    font-weight: 700;
    font-size: 22px;
    color: #fff8dc;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,

  tagRow: css`
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  `,

  tag: css`
    font-size: 12px;
    font-family: 'Nunito', sans-serif;
    color: #c9a84c;
    background: rgba(74, 58, 110, 0.5);
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid #4a3a6e;
  `,

  elementBadge: (color: string) => css`
    font-size: 12px;
    font-family: 'Nunito', sans-serif;
    font-weight: 700;
    color: ${color};
    background: ${color}22;
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid ${color}55;
  `,

  // ─── статус производства ────────────────────────────────────────────────────

  statusBox: (accent: string) => css`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px;
    background: rgba(74, 58, 110, 0.3);
    border: 1px solid ${accent};
    border-radius: 8px;
  `,

  statusTitle: css`
    font-family: 'Balsamiq Sans', cursive;
    font-weight: 700;
    font-size: 15px;
    color: #fff8dc;
  `,

  statusNote: css`
    font-size: 12px;
    color: #a090c0;
  `,

  collectBtn: css`
    padding: 10px 12px;
    background: #2f8f57;
    border: 1px solid #40c070;
    border-radius: 8px;
    color: #fff8dc;
    font-family: 'Balsamiq Sans', cursive;
    font-weight: 700;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.15s;
    &:hover {
      background: #36a564;
    }
    &:active {
      background: #287a4a;
    }
  `,

  progressTrack: css`
    width: 100%;
    height: 10px;
    background: rgba(20, 14, 36, 0.6);
    border-radius: 5px;
    overflow: hidden;
  `,

  progressFill: (pct: number) => css`
    width: ${pct}%;
    height: 100%;
    background: linear-gradient(90deg, #f0a030, #f0c040);
    transition: width 0.4s linear;
  `,

  // ─── правая колонка ─────────────────────────────────────────────────────────

  rightCol: css`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
  `,

  yieldRow: css`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    margin-top: auto;
    background: rgba(74, 58, 110, 0.3);
    border: 1px solid #4a3a6e;
    border-radius: 8px;
  `,

  yieldInfo: css`
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
  `,

  yieldValue: css`
    font-family: 'Nunito', sans-serif;
    font-weight: 800;
    font-size: 16px;
    color: #fff8dc;
  `,

  yieldLevel: css`
    font-size: 12px;
    color: #a090c0;
  `,

  upgradeBtn: (enabled: boolean) => css`
    padding: 8px 14px;
    background: ${enabled ? 'rgba(201, 168, 76, 0.25)' : 'rgba(74, 58, 110, 0.25)'};
    border: 1px solid ${enabled ? '#c9a84c' : '#4a3a6e'};
    border-radius: 6px;
    color: ${enabled ? '#f0c040' : '#7060a0'};
    font-family: 'Balsamiq Sans', cursive;
    font-weight: 700;
    font-size: 14px;
    cursor: ${enabled ? 'pointer' : 'not-allowed'};
    white-space: nowrap;
    transition: background 0.15s;
    &:hover {
      background: ${enabled ? 'rgba(201, 168, 76, 0.4)' : 'rgba(74, 58, 110, 0.25)'};
    }
  `,

  // ─── нижний лоток с едой ────────────────────────────────────────────────────

  foodTray: css`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    padding: 10px 14px;
    min-width: 160px;
    min-height: 18px;
    max-width: 90vw;
    overflow-x: auto;
    background: rgba(14, 10, 28, 0.75);
    backdrop-filter: blur(6px);
    border: 1.5px solid rgba(90, 74, 142, 0.6);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    scrollbar-width: thin;
    scrollbar-color: #4a3a6e transparent;
    flex-shrink: 0;
    &::-webkit-scrollbar {
      height: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: #4a3a6e;
      border-radius: 2px;
    }
  `,

  foodTrayHint: css`
    padding: 4px 8px;
    font-size: 13px;
    color: #7060a0;
    font-family: 'Nunito', sans-serif;
    white-space: nowrap;
  `,

  foodItem: (isFav: boolean, isDisliked: boolean) => css`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 10px;
    border-radius: 8px;
    cursor: grab;
    border-left: 2px solid ${isFav ? '#3a8060' : isDisliked ? '#a03838' : 'transparent'};
    transition: background 0.1s;
    user-select: none;
    flex-shrink: 0;
    &:hover {
      background: rgba(80, 50, 130, 0.5);
    }
    &:active {
      background: rgba(100, 60, 160, 0.6);
    }
  `,

  foodPrefDot: (isFav: boolean, isDisliked: boolean) => css`
    width: 9px;
    height: 9px;
    border-radius: 50%;
    flex-shrink: 0;
    background: ${isFav ? '#40c070' : isDisliked ? '#e05050' : '#4a3a6e'};
    box-shadow: 0 0 4px ${isFav ? '#40c070' : isDisliked ? '#e05050' : '#4a3a6e'}99;
  `,

  foodName: css`
    font-size: 12px;
    font-weight: 700;
    color: #d4cce8;
    font-family: 'Nunito', sans-serif;
    flex-shrink: 0;
  `,

  foodYield: (isFav: boolean, isDisliked: boolean) => css`
    font-size: 12px;
    font-weight: 800;
    font-family: 'Nunito', sans-serif;
    color: ${isFav ? '#40c070' : isDisliked ? '#e05050' : '#c9a84c'};
    flex-shrink: 0;
  `,

  foodCount: css`
    font-size: 12px;
    color: #a090c0;
    font-weight: 700;
    font-family: 'Nunito', sans-serif;
    flex-shrink: 0;
  `,
};
