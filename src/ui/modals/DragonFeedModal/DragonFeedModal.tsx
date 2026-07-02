import { useState, useEffect, useCallback, useRef } from 'react';
import { useUIStore } from '@store/useUIStore';
import { useGameStore } from '@store/useGameStore';
import { useDragons, useDragonActions } from '@store/useDragonsStore';
import { MAX_RESOURCE_PER_TYPE } from '@store/types';
import { feedYield, yieldMultiplier } from '@store/slices/dragonsSlice';
import { hasInfiniteStorage } from '@store/slices/gameSlice';
import ModalShell from '@/ui/modals/ModalShell/ModalShell';
import ContentLoader from '@game/systems/ContentLoader';
import { DRAGON_STAGE, PRODUCTION_STATE } from '@/types/dragon';
import { YIELD_UPGRADE_MAX_LEVEL, yieldUpgradeCost } from '@/consts/balance';
import { productionView, formatTime } from './helpers';
import { styles } from './styles';

const dragonImages = import.meta.glob('../../../assets/dragons/**/*_dragon.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const getDragonImageUrl = (dragonId: string): string | undefined =>
  dragonImages[`../../../assets/dragons/${dragonId}/${dragonId}_dragon.png`];

const STAGE_LABEL: Partial<Record<string, string>> = {
  [DRAGON_STAGE.BABY]: 'детёныш',
  [DRAGON_STAGE.EGG]: 'яйцо',
};

const STATUS_ACCENT: Record<string, string> = {
  [PRODUCTION_STATE.READY]: '#40c070',
  [PRODUCTION_STATE.PRODUCING]: '#f0a030',
  [PRODUCTION_STATE.HUNGRY]: '#c9a84c',
  [PRODUCTION_STATE.FULL]: '#e05050',
};

const ELEMENT_COLOR: Record<string, string> = {
  fire: '#e05030',
  water: '#3080d0',
  earth: '#60a040',
  storm: '#c0b020',
  ice: '#60c0e0',
  wind: '#a0c0e0',
  nature: '#40b840',
  light: '#e0d060',
  shadow: '#7040c0',
  cosmos: '#b060e0',
  time: '#c08030',
};

function DragonFeedModal() {
  const dragonPanel = useUIStore((s) => s.dragonPanel);
  const setDragonPanel = useUIStore((s) => s.setDragonPanel);
  const dragons = useDragons();
  const resources = useGameStore((s) => s.resources);
  const coins = useGameStore((s) => s.coins);
  const infinite = useGameStore(hasInfiniteStorage);
  const { feedDragon, collectResource, upgradeDragonYield } = useDragonActions();
  const [, setTick] = useState(0);
  const [dragOverDragon, setDragOverDragon] = useState(false);
  const draggedPlantRef = useRef<string | null>(null);

  const dragon = dragonPanel
    ? (dragons.find((d) => d.uid === dragonPanel.dragonUid) ?? null)
    : null;
  const def = dragon ? ContentLoader.dragon(dragon.id) : null;

  useEffect(() => {
    if (!dragonPanel) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [dragonPanel]);

  const close = useCallback(() => setDragonPanel(null), [setDragonPanel]);

  if (!dragonPanel || !dragon || !def) return null;

  const { prod, stored, progressPct, remainingMs } = productionView(
    dragon,
    def.resource,
    resources,
    infinite,
    def.production_duration_ms,
  );

  const yieldLevel = dragon.yield_level ?? 0;
  const effectiveBase = Math.floor(def.yield_per_feed * yieldMultiplier(yieldLevel));
  const maxed = yieldLevel >= YIELD_UPGRADE_MAX_LEVEL;
  const upgradeCost = yieldUpgradeCost(yieldLevel);
  const canUpgrade = !maxed && coins >= upgradeCost;

  const allPlants = ContentLoader.allPlants();
  const inventoryPlants = allPlants.filter((p) => (resources[p.id] ?? 0) > 0);

  const handleFeed = (plantId: string) => feedDragon(dragon.uid, plantId);
  const handleCollect = () => collectResource(dragon.uid);
  const handleUpgrade = () => upgradeDragonYield(dragon.uid);

  const handleFoodDragStart = (plantId: string) => {
    draggedPlantRef.current = plantId;
  };

  const handleFoodDragEnd = () => {
    draggedPlantRef.current = null;
    setDragOverDragon(false);
  };

  const handleDragonDragOver = (e: React.DragEvent) => {
    if (!draggedPlantRef.current) return;
    e.preventDefault();
    setDragOverDragon(true);
  };

  const handleDragonDragLeave = () => setDragOverDragon(false);

  const handleDragonDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const plantId = draggedPlantRef.current;
    draggedPlantRef.current = null;
    setDragOverDragon(false);
    if (plantId) handleFeed(plantId);
  };

  const stageLabel = STAGE_LABEL[dragon.stage];
  const accent = STATUS_ACCENT[prod.state];
  const imgUrl = getDragonImageUrl(dragon.id);
  const elemColor = ELEMENT_COLOR[def.element] ?? '#8090a0';

  return (
    <ModalShell
      onClose={close}
      below={
        <div css={styles.foodTray}>
          {!prod.canFeed ? (
            <span css={styles.foodTrayHint}>Кормление недоступно</span>
          ) : inventoryPlants.length === 0 ? (
            <span css={styles.foodTrayHint}>Нет растений в инвентаре</span>
          ) : (
            inventoryPlants.map((plant) => {
              const isFav = def.favorite_food.includes(plant.id);
              const isDisliked = def.disliked_food.includes(plant.id);
              const count = resources[plant.id] ?? 0;
              const batch = feedYield(def, dragon, plant.id);
              return (
                <div
                  key={plant.id}
                  css={styles.foodItem(isFav, isDisliked)}
                  draggable
                  onDragStart={() => handleFoodDragStart(plant.id)}
                  onDragEnd={handleFoodDragEnd}
                  onClick={() => handleFeed(plant.id)}
                >
                  <span css={styles.foodPrefDot(isFav, isDisliked)} />
                  <span css={styles.foodName}>{plant.name}</span>
                  <span css={styles.foodYield(isFav, isDisliked)}>+{batch}</span>
                  <span css={styles.foodCount}>×{count}</span>
                </div>
              );
            })
          )}
        </div>
      }
    >
      <div css={styles.root}>
        {/* ─── левая колонка: изображение дракона ─── */}
        <div css={styles.leftCol}>
          <div
            css={[styles.dragonImageBox, dragOverDragon && styles.dragonImageBoxDragOver]}
            onDragOver={handleDragonDragOver}
            onDragLeave={handleDragonDragLeave}
            onDrop={handleDragonDrop}
          >
            {imgUrl ? (
              <img src={imgUrl} css={styles.dragonImage} alt={def.name} />
            ) : (
              <div css={styles.dragonImagePlaceholder(elemColor)} />
            )}
          </div>
        </div>

        {/* ─── правая колонка: вся инфа о драконе и гнезде ─── */}
        <div css={styles.rightCol}>
          <div css={styles.dragonMeta}>
            <span css={styles.dragonName}>{dragon.nickname ?? def.name}</span>
            <div css={styles.tagRow}>
              {stageLabel && <span css={styles.tag}>{stageLabel}</span>}
              <span css={styles.elementBadge(elemColor)}>{def.element}</span>
            </div>
          </div>

          <div css={styles.statusBox(accent)}>
            {prod.state === PRODUCTION_STATE.READY && (
              <>
                <span css={styles.statusTitle}>
                  Готово: {prod.pending} {def.resource}
                </span>
                <button css={styles.collectBtn} onClick={handleCollect}>
                  Собрать
                </button>
              </>
            )}
            {prod.state === PRODUCTION_STATE.PRODUCING && (
              <>
                <span css={styles.statusTitle}>Производит {prod.pending}…</span>
                <div css={styles.progressTrack}>
                  <div css={styles.progressFill(progressPct)} />
                </div>
                <span css={styles.statusNote}>Осталось {formatTime(remainingMs)}</span>
              </>
            )}
            {prod.state === PRODUCTION_STATE.HUNGRY && dragon.stage !== DRAGON_STAGE.ADULT && (
              <>
                <span css={styles.statusTitle}>
                  {dragon.stage === DRAGON_STAGE.EGG ? 'Яйцо' : 'Детёныш'}
                </span>
                <span css={styles.statusNote}>
                  {dragon.stage === DRAGON_STAGE.EGG
                    ? 'Инкубируется. Дождитесь вылупления.'
                    : 'Ещё растёт. Производство начнётся после взросления.'}
                </span>
              </>
            )}
            {prod.state === PRODUCTION_STATE.HUNGRY && dragon.stage === DRAGON_STAGE.ADULT && (
              <>
                <span css={styles.statusTitle}>Голодный</span>
                <span css={styles.statusNote}>
                  Покормите дракона, чтобы запустить производство.
                </span>
              </>
            )}
            {prod.state === PRODUCTION_STATE.FULL && (
              <>
                <span css={styles.statusTitle}>Не голодный</span>
                <span css={styles.statusNote}>
                  Склад {def.resource} полон ({stored}/{MAX_RESOURCE_PER_TYPE}). Освободите место.
                </span>
              </>
            )}
          </div>

          <div css={styles.yieldRow}>
            <div css={styles.yieldInfo}>
              <span css={styles.yieldValue}>Выход за кормление: {effectiveBase}</span>
              <span css={styles.yieldLevel}>
                Уровень {yieldLevel}/{YIELD_UPGRADE_MAX_LEVEL}
              </span>
            </div>
            <button
              css={styles.upgradeBtn(canUpgrade)}
              onClick={handleUpgrade}
              disabled={!canUpgrade}
            >
              {maxed ? 'Максимум' : `Улучшить · ${upgradeCost} 🪙`}
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

export default DragonFeedModal;
