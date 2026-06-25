import { css } from '@emotion/react';

export const styles = {
  root: css`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
    color: #d4cce8;
    font-family: serif;
  `,

  header: css`
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    flex-shrink: 0;
  `,

  title: css`
    font-size: 20px;
    font-weight: bold;
    color: #f0e8d0;
    flex: 1;
  `,

  biomeTag: css`
    font-size: 12px;
    color: #a090c0;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid #4a3a6e;
    border-radius: 4px;
    padding: 2px 8px;
  `,

  upgradeBtn: css`
    font-family: serif;
    font-size: 13px;
    color: #f0c040;
    background: rgba(80, 60, 20, 0.7);
    border: 1px solid #c09020;
    border-radius: 4px;
    padding: 4px 10px;
    cursor: pointer;
    &:hover {
      background: rgba(110, 80, 20, 0.9);
    }
    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `,

  grid: (cols: number) => css`
    display: grid;
    grid-template-columns: repeat(${cols}, 1fr);
    gap: 6px;
    flex: 1;
    overflow: hidden;
  `,

  slot: css`
    border: 1px solid #4a3a6e;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    background: rgba(0, 0, 0, 0.3);
    cursor: pointer;
    padding: 4px;
    min-height: 0;
    &:hover {
      border-color: #8a6aae;
      background: rgba(60, 40, 90, 0.5);
    }
  `,

  slotEmpty: css`
    font-size: 22px;
    color: #5a4a7e;
  `,

  slotAltar: css`
    border-color: #c09020;
    background: rgba(80, 60, 10, 0.5);
    cursor: default;
    &:hover {
      border-color: #c09020;
      background: rgba(80, 60, 10, 0.5);
    }
  `,

  slotReady: css`
    border-color: #40c070;
    animation: gardenPulse 1.2s ease-in-out infinite;
    @keyframes gardenPulse {
      0%, 100% { border-color: #40c070; }
      50% { border-color: #80ffa0; box-shadow: 0 0 6px #60e080; }
    }
  `,

  slotIcon: css`
    font-size: 20px;
    line-height: 1;
  `,

  slotLabel: css`
    font-size: 10px;
    text-align: center;
    line-height: 1.2;
    color: #a090c0;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,

  slotTimer: css`
    font-size: 10px;
    color: #80c0ff;
  `,

  footer: css`
    display: flex;
    gap: 8px;
    margin-top: 10px;
    flex-shrink: 0;
    flex-wrap: wrap;
  `,

  footerBtn: css`
    font-family: serif;
    font-size: 13px;
    color: #d4cce8;
    background: rgba(30, 20, 50, 0.8);
    border: 1px solid #4a3a6e;
    border-radius: 4px;
    padding: 5px 12px;
    cursor: pointer;
    &:hover {
      border-color: #8a6aae;
      background: rgba(60, 40, 90, 0.7);
    }
    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `,

  altarActive: css`
    color: #f0c040;
    border-color: #c09020;
  `,

  pickerOverlay: css`
    position: absolute;
    bottom: 60px;
    left: 0;
    right: 0;
    background: rgba(19, 16, 30, 0.97);
    border: 1px solid #4a3a6e;
    border-radius: 6px;
    padding: 10px 12px;
    z-index: 10;
  `,

  pickerTitle: css`
    font-size: 13px;
    color: #a090c0;
    margin-bottom: 8px;
  `,

  pickerList: css`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    max-height: 120px;
    overflow-y: auto;
  `,

  plantCard: (isNative: boolean) => css`
    font-family: serif;
    font-size: 12px;
    color: ${isNative ? '#80ffb0' : '#d4cce8'};
    background: rgba(30, 20, 50, 0.9);
    border: 1px solid ${isNative ? '#40a060' : '#4a3a6e'};
    border-radius: 4px;
    padding: 4px 8px;
    cursor: pointer;
    line-height: 1.4;
    text-align: left;
    &:hover {
      border-color: ${isNative ? '#80ffa0' : '#8a6aae'};
    }
  `,

  plantCardTime: css`
    color: #7090c0;
    font-size: 11px;
  `,
};
