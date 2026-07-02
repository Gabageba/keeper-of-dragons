import { css } from '@emotion/react';

export const styles = {
  root: css`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    position: relative;
    color: #d4cce8;
    font-family: 'Nunito', sans-serif;
  `,

  header: css`
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
    flex-shrink: 0;
  `,

  title: css`
    font-family: 'Balsamiq Sans', cursive;
    font-size: 22px;
    font-weight: 700;
    color: #fff8dc;
    flex: 1;
  `,

  biomeTag: css`
    font-size: 11px;
    font-weight: 700;
    color: #a090c0;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid #4a3a6e;
    border-radius: 4px;
    padding: 2px 7px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    flex-shrink: 0;
  `,

  headerActions: css`
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  `,

  upgradeBtn: css`
    font-family: 'Nunito', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: #f0c040;
    background: rgba(80, 60, 20, 0.7);
    border: 1px solid #c09020;
    border-radius: 6px;
    padding: 4px 10px;
    cursor: pointer;
    white-space: nowrap;
    &:hover {
      background: rgba(110, 80, 20, 0.9);
    }
    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `,

  altarBtn: css`
    font-size: 16px;
    background: rgba(30, 20, 50, 0.7);
    border: 1px solid #4a3a6e;
    border-radius: 6px;
    padding: 4px 8px;
    cursor: pointer;
    color: #a090c0;
    line-height: 1;
    &:hover {
      border-color: #8a6aae;
      background: rgba(60, 40, 90, 0.7);
    }
    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
  `,

  altarBtnActive: css`
    color: #f0c040;
    border-color: #c09020;
    background: rgba(80, 60, 10, 0.6);
    &:hover {
      border-color: #e0b030;
      background: rgba(100, 75, 15, 0.8);
    }
  `,

  grid: (cols: number) => css`
    display: grid;
    grid-template-columns: repeat(${cols}, 1fr);
    gap: 8px;
    flex: 1;
    min-height: 0;
  `,

  slot: css`
    position: relative;
    border: 2px solid #3a2a5e;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    background: rgba(0, 0, 0, 0.25);
    cursor: pointer;
    padding: 4px;
    min-height: 0;
    transition:
      border-color 0.15s,
      background 0.15s;
    &:hover {
      border-color: #7a5aae;
      background: rgba(60, 40, 90, 0.45);
    }
  `,

  slotEmpty: css``,

  slotEmptyPlus: css`
    font-size: 26px;
    color: #4a3a6e;
    line-height: 1;
    font-weight: 300;
  `,

  slotSelected: css`
    z-index: 1;
    border-color: #a070ff;
    background: rgba(80, 40, 140, 0.4);
    box-shadow: 0 0 0 2px rgba(160, 112, 255, 0.35);
    &:hover {
      border-color: #b888ff;
    }
  `,

  slotDragOver: css`
    border-color: #60d090;
    background: rgba(40, 120, 70, 0.3);
    box-shadow: 0 0 0 2px rgba(96, 208, 144, 0.35);
  `,

  slotAltar: css`
    border-color: #c09020;
    background: rgba(80, 60, 10, 0.45);
    cursor: default;
    &:hover {
      border-color: #c09020;
      background: rgba(80, 60, 10, 0.45);
    }
  `,

  slotReady: css`
    border-color: #40c070;
    cursor: pointer;
    animation: gardenPulse 1.2s ease-in-out infinite;
    @keyframes gardenPulse {
      0%,
      100% {
        border-color: #40c070;
        box-shadow: none;
      }
      50% {
        border-color: #80ffa0;
        box-shadow: 0 0 8px rgba(96, 224, 128, 0.5);
      }
    }
  `,

  slotIcon: css`
    font-size: 22px;
    line-height: 1;
  `,

  slotLabel: css`
    font-size: 10px;
    font-weight: 600;
    text-align: center;
    line-height: 1.2;
    color: #b0a0d0;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,

  slotTimer: css`
    font-size: 10px;
    font-weight: 700;
    color: #70a0d0;
  `,

  toolPanel: css`
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

  seedRow: (isNative: boolean, canAfford: boolean) => css`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 10px;
    border-radius: 8px;
    cursor: ${canAfford ? 'grab' : 'not-allowed'};
    opacity: ${canAfford ? 1 : 0.4};
    border-left: 2px solid ${isNative ? '#3a8060' : 'transparent'};
    transition: background 0.1s;
    user-select: none;
    flex-shrink: 0;
    &:hover {
      ${canAfford ? 'background: rgba(80, 50, 130, 0.5);' : ''}
    }
    &:active {
      ${canAfford ? 'background: rgba(100, 60, 160, 0.6);' : ''}
    }
  `,

  seedDot: (color: string) => css`
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: ${color};
    flex-shrink: 0;
    box-shadow: 0 0 4px ${color}99;
  `,

  seedName: css`
    font-size: 12px;
    font-weight: 700;
    color: #d4cce8;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,

  seedNative: css`
    color: #50d090;
    font-size: 11px;
  `,

  seedCost: css`
    font-size: 12px;
    font-weight: 800;
    color: #e0c040;
    flex-shrink: 0;
  `,

  seedFillAllBtn: css`
    font-family: 'Nunito', sans-serif;
    font-size: 10px;
    font-weight: 800;
    color: #80d0a0;
    background: rgba(30, 90, 55, 0.55);
    border: 1px solid #3a8060;
    border-radius: 4px;
    padding: 2px 6px;
    cursor: pointer;
    flex-shrink: 0;
    white-space: nowrap;
    &:hover {
      background: rgba(50, 120, 75, 0.75);
      border-color: #60d090;
    }
    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
  `,

  sickleItem: css`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 18px;
    border-radius: 8px;
    cursor: grab;
    border-left: 2px solid #60d090;
    color: #80ffb0;
    font-size: 13px;
    font-weight: 800;
    white-space: nowrap;
    flex-shrink: 0;
    user-select: none;
    transition: background 0.1s;
    &:hover {
      background: rgba(40, 120, 70, 0.5);
    }
    &:active {
      background: rgba(50, 150, 90, 0.6);
    }
  `,
};
