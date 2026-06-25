import { css } from '@emotion/react';
import { useUIStore } from '@store/useUIStore';

const styles = {
  overlay: css`
    position: fixed;
    inset: 0;
    background: #0d0b14;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `,
  title: css`
    font-family: 'Balsamiq Sans', cursive;
    font-weight: 700;
    font-size: 28px;
    color: #c9a84c;
    margin-bottom: 8px;
  `,
  subtitle: css`
    font-family: 'Nunito Variable', sans-serif;
    font-weight: 600;
    font-size: 16px;
    color: #8a7a9b;
    margin-bottom: 32px;
  `,
  barBg: css`
    width: 420px;
    height: 28px;
    background: #2e2845;
    border: 1px solid #c9a84c;
    border-radius: 4px;
    overflow: hidden;
  `,
  bar: css`
    height: 100%;
    background: #e8c97a;
    transition: width 0.1s linear;
  `,
};

function LoadingScreen() {
  const progress = useUIStore((s) => s.loadingProgress);

  return (
    <div css={styles.overlay}>
      <div css={styles.title}>Хранитель Драконов</div>
      <div css={styles.subtitle}>Расти, корми, обнимай</div>
      <div css={styles.barBg}>
        <div
          css={[
            styles.bar,
            css`
              width: ${progress * 100}%;
            `,
          ]}
        />
      </div>
    </div>
  );
}

export default LoadingScreen;
