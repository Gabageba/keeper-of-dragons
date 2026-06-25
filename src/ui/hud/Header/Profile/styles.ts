import { css } from '@emotion/react';
import profile from '@/assets/ui/profile.png';
import token from '@/ui/shared/token';

const styles = {
  profile: css`
    position: relative;
    height: 100px;
    width: 258px;
    background-image: url(${profile});
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: center;
  `,
  level: css`
    ${token.accentText}
    font-weight: 700;
    position: absolute;
    top: 21px;
    right: 9px;
    padding-inline: 8px;
    padding-block: 4px;
    height: 31px;
    width: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  avatar: css`
    position: absolute;
    top: 13px;
    left: 13px;
    width: 73px;
    height: 73px;
    border-radius: 50%;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.2);
  `,
  progressTrack: css`
    position: absolute;
    top: 59px;
    left: 107px;
    right: 13px;
    height: 13px;
    border-radius: 6px;
    background: transparent;
    overflow: hidden;
  `,
  progressFill: (pct: number) => css`
    position: relative;
    height: 100%;
    width: ${pct}%;
    background: ${token.goldColor};
    border-radius: 6px;
    transition: width 0.3s ease;
    overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 55%;
      background: linear-gradient(to bottom, rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.08));
      border-radius: 6px 6px 0 0;
    }
  `,
};

export default styles;
