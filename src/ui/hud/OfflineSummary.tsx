import { css } from '@emotion/react';
import { useUIStore } from '@store/useUIStore';

const styles = {
  overlay: css`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    pointer-events: auto;
    cursor: pointer;
  `,
  card: css`
    background: #1e1a2e;
    border: 1px solid #c9a84c;
    border-radius: 8px;
    padding: 28px 40px;
    min-width: 320px;
    text-align: center;
    font-family: serif;
    cursor: default;
  `,
  elapsed: css`
    color: #d4cce8;
    font-size: 20px;
    line-height: 2;
  `,
  gainsList: css`
    margin-top: 8px;
  `,
  gainRow: css`
    color: #c9a84c;
    font-size: 18px;
    line-height: 1.8;
  `,
  notice: css`
    color: #d4cce8;
    font-size: 18px;
    margin-top: 6px;
  `,
  dismissHint: css`
    color: #9a8ab8;
    font-size: 15px;
    margin-top: 20px;
    cursor: pointer;
  `,
};

function OfflineSummary() {
  const offlineSummary = useUIStore((s) => s.offlineSummary);
  const dismiss = () => useUIStore.getState().setOfflineSummary(null);

  if (!offlineSummary) return null;

  const { elapsed_ms, resources_gained, breeding_completed, eggs_hatched } = offlineSummary;
  const hours = Math.floor(elapsed_ms / 3_600_000);
  const minutes = Math.floor((elapsed_ms % 3_600_000) / 60_000);
  const timeStr = hours > 0 ? `${hours} ч ${minutes} мин` : `${minutes} мин`;

  const gains = Object.entries(resources_gained).filter(([, v]) => v > 0);

  return (
    <div onClick={dismiss} css={styles.overlay}>
      <div onClick={(e) => e.stopPropagation()} css={styles.card}>
        <div css={styles.elapsed}>Пока вас не было: {timeStr}</div>

        {gains.length > 0 && (
          <div css={styles.gainsList}>
            {gains.map(([resource, amount]) => (
              <div key={resource} css={styles.gainRow}>
                + {amount}
                {'  '}
                {resource}
              </div>
            ))}
          </div>
        )}

        {breeding_completed && <div css={styles.notice}>Скрещивание завершено!</div>}
        {eggs_hatched > 0 && <div css={styles.notice}>Вылупилось яиц: {eggs_hatched}</div>}

        <div onClick={dismiss} css={styles.dismissHint}>
          Нажмите, чтобы продолжить
        </div>
      </div>
    </div>
  );
}

export default OfflineSummary;
