import { useUIStore } from '@/store/useUIStore';

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
    <div
      onClick={dismiss}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        pointerEvents: 'auto',
        cursor: 'pointer',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1e1a2e',
          border: '1px solid #c9a84c',
          borderRadius: 8,
          padding: '28px 40px',
          minWidth: 320,
          textAlign: 'center',
          fontFamily: 'serif',
          cursor: 'default',
        }}
      >
        <div style={{ color: '#d4cce8', fontSize: 20, lineHeight: 2 }}>
          Пока вас не было: {timeStr}
        </div>

        {gains.length > 0 && (
          <div style={{ marginTop: 8 }}>
            {gains.map(([resource, amount]) => (
              <div key={resource} style={{ color: '#c9a84c', fontSize: 18, lineHeight: 1.8 }}>
                + {amount}
                {'  '}
                {resource}
              </div>
            ))}
          </div>
        )}

        {breeding_completed && (
          <div style={{ color: '#d4cce8', fontSize: 18, marginTop: 6 }}>Скрещивание завершено!</div>
        )}
        {eggs_hatched > 0 && (
          <div style={{ color: '#d4cce8', fontSize: 18, marginTop: 6 }}>
            Вылупилось яиц: {eggs_hatched}
          </div>
        )}

        <div
          onClick={dismiss}
          style={{ color: '#9a8ab8', fontSize: 15, marginTop: 20, cursor: 'pointer' }}
        >
          Нажмите, чтобы продолжить
        </div>
      </div>
    </div>
  );
}

export default OfflineSummary;
