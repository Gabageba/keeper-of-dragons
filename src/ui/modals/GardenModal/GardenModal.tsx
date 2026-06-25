import { useState, useEffect, useCallback } from 'react';
import { useUIStore } from '@store/useUIStore';
import { useGardens, useGardenActions } from '@store/useGardenStore';
import { useGameStore } from '@store/useGameStore';
import ModalShell from '@/ui/modals/ModalShell/ModalShell';
import ContentLoader from '@game/systems/ContentLoader';
import type { PlantDef } from '@/types/plant';
import {
  gardenSide,
  altarSlotIndex,
  calcGrowMs,
  growthStage,
  remainingMs,
  formatTime,
  GARDEN_UPGRADE_COST,
} from './helpers';
import { styles } from './styles';

const STAGE_ICON: Record<0 | 1 | 2, string> = { 0: '🌱', 1: '🌿', 2: '✅' };
const BIOME_LABEL: Record<string, string> = {
  volcanic: 'Вулканический',
  lunar: 'Лунный',
  storm: 'Грозовой',
  crystal: 'Кристальный',
  ice: 'Ледяной',
  air: 'Воздушный',
  nature: 'Природный',
  shadow: 'Теневой',
  cosmic: 'Космический',
};

function GardenModal() {
  const gardenPanel = useUIStore((s) => s.gardenPanel);
  const setGardenPanel = useUIStore((s) => s.setGardenPanel);
  const gardens = useGardens();
  const { plantSeed, harvest, upgradeGarden, toggleAltar } = useGardenActions();
  const coins = useGameStore((s) => s.coins);

  const [pickerTarget, setPickerTarget] = useState<number | 'all' | null>(null);
  const [lastPlantId, setLastPlantId] = useState<string | null>(null);
  // dummy tick to re-render growing plants
  const [, setTick] = useState(0);

  const garden = gardenPanel !== null ? (gardens[gardenPanel.gardenIndex] ?? null) : null;

  useEffect(() => {
    if (!garden) return;
    const hasGrowing = garden.slots.some((s) => s.plant && s.planted_at);
    if (!hasGrowing) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [garden]);

  const close = useCallback(() => {
    setGardenPanel(null);
    setPickerTarget(null);
  }, [setGardenPanel]);

  if (!gardenPanel || !garden) return null;

  const { gardenIndex } = gardenPanel;
  const side = gardenSide(garden.upgraded);
  const altarIdx = altarSlotIndex(garden.upgraded);
  const allPlants = ContentLoader.allPlants();

  const handleSlotClick = (slotIdx: number) => {
    if (slotIdx === altarIdx && garden.hasAltar) return;
    const slot = garden.slots[slotIdx];
    if (!slot) return;

    if (slot.plant) {
      const plantDef = ContentLoader.plant(slot.plant);
      if (!plantDef) return;
      const growMs = calcGrowMs(plantDef, garden);
      if (growthStage(slot, growMs) === 2) {
        harvest(gardenIndex, slotIdx);
      }
      return;
    }
    setPickerTarget(slotIdx);
  };

  const handlePickPlant = (plantId: string) => {
    setLastPlantId(plantId);
    if (pickerTarget === 'all') {
      garden.slots.forEach((slot, si) => {
        if (!slot.plant && !(si === altarIdx && garden.hasAltar)) {
          plantSeed(gardenIndex, si, plantId);
        }
      });
    } else if (pickerTarget !== null) {
      plantSeed(gardenIndex, pickerTarget, plantId);
    }
    setPickerTarget(null);
  };

  const handleSeedAll = () => {
    if (lastPlantId) {
      garden.slots.forEach((slot, si) => {
        if (!slot.plant && !(si === altarIdx && garden.hasAltar)) {
          plantSeed(gardenIndex, si, lastPlantId);
        }
      });
    } else {
      setPickerTarget('all');
    }
  };

  const handleUpgrade = () => {
    upgradeGarden(gardenIndex);
  };

  const handleAltarToggle = () => {
    toggleAltar(gardenIndex);
  };

  const biomeLabel = BIOME_LABEL[garden.biome] ?? garden.biome;
  const canUpgrade = !garden.upgraded && coins >= GARDEN_UPGRADE_COST;
  const allSlotsFull = garden.slots.every((s) => !!s.plant);
  const canEnableAltar = garden.hasAltar || !allSlotsFull;

  return (
    <ModalShell onClose={close}>
      <div css={styles.root}>
        <div css={styles.header}>
          <span css={styles.title}>{biomeLabel} сад</span>
          <span css={styles.biomeTag}>{garden.biome}</span>
          {!garden.upgraded && (
            <button
              css={styles.upgradeBtn}
              onClick={handleUpgrade}
              disabled={!canUpgrade}
              title={canUpgrade ? '' : `Нужно ${GARDEN_UPGRADE_COST} монет`}
            >
              4×4 — {GARDEN_UPGRADE_COST}💰
            </button>
          )}
        </div>

        <div css={styles.grid(side)}>
          {garden.slots.map((slot, si) => {
            const isAltar = si === altarIdx && garden.hasAltar;

            if (isAltar) {
              return (
                <div key={si} css={[styles.slot, styles.slotAltar]}>
                  <span css={styles.slotIcon}>⚗</span>
                  <span css={styles.slotLabel}>Алтарь</span>
                </div>
              );
            }

            if (!slot.plant) {
              return (
                <div key={si} css={styles.slot} onClick={() => handleSlotClick(si)}>
                  <span css={[styles.slotIcon, styles.slotEmpty]}>+</span>
                </div>
              );
            }

            const plantDef = ContentLoader.plant(slot.plant) as PlantDef | undefined;
            const growMs = plantDef ? calcGrowMs(plantDef, garden) : 60_000;
            const stage = growthStage(slot, growMs);
            const isReady = stage === 2;
            const timeLeft = remainingMs(slot, growMs);

            return (
              <div
                key={si}
                css={[styles.slot, isReady && styles.slotReady]}
                onClick={() => handleSlotClick(si)}
                title={isReady ? 'Тап — собрать!' : undefined}
              >
                <span css={styles.slotIcon}>{STAGE_ICON[stage]}</span>
                <span css={styles.slotLabel}>{plantDef?.name ?? slot.plant}</span>
                {!isReady && <span css={styles.slotTimer}>{formatTime(timeLeft)}</span>}
              </div>
            );
          })}
        </div>

        <div css={styles.footer}>
          <button css={styles.footerBtn} onClick={handleSeedAll}>
            {lastPlantId
              ? `Засеять всё: ${ContentLoader.plant(lastPlantId)?.name ?? lastPlantId}`
              : 'Засеять всё…'}
          </button>
          <button
            css={[styles.footerBtn, garden.hasAltar && styles.altarActive]}
            onClick={handleAltarToggle}
            disabled={!canEnableAltar}
            title={!canEnableAltar ? 'Освободите хотя бы одно поле' : undefined}
          >
            {garden.hasAltar ? '⚗ Алтарь: ВКЛ' : '⚗ Алтарь: ВЫКЛ'}
          </button>
        </div>

        {pickerTarget !== null && (
          <div css={styles.pickerOverlay}>
            <div css={styles.pickerTitle}>
              {pickerTarget === 'all' ? 'Выберите семя для всех слотов:' : 'Выберите семя:'}
            </div>
            <div css={styles.pickerList}>
              {allPlants.map((p) => {
                const isNative = p.native_biome === 'any' || p.native_biome === garden.biome;
                const growMs = calcGrowMs(p, garden);
                const growMin = Math.round(growMs / 60_000);
                return (
                  <button
                    key={p.id}
                    css={styles.plantCard(isNative)}
                    onClick={() => handlePickPlant(p.id)}
                  >
                    {p.name}
                    {isNative && ' ★'}
                    <br />
                    <span css={styles.plantCardTime}>~{growMin}м</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

export default GardenModal;
