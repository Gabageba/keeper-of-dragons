import { useState, useEffect, useCallback, useRef } from 'react';
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

const ELEMENT_COLOR: Record<string, string> = {
  fire: '#e05030',
  water: '#3080d0',
  earth: '#60a040',
  storm: '#9050d0',
  ice: '#60c0e0',
  air: '#a0c0e0',
  shadow: '#5040a0',
  cosmic: '#c060e0',
  neutral: '#8090a0',
};

function GardenModal() {
  const gardenPanel = useUIStore((s) => s.gardenPanel);
  const setGardenPanel = useUIStore((s) => s.setGardenPanel);
  const gardens = useGardens();
  const { plantSeed, harvest, upgradeGarden, toggleAltar } = useGardenActions();
  const coins = useGameStore((s) => s.coins);

  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [harvestDragging, setHarvestDragging] = useState(false);
  const [seedDragging, setSeedDragging] = useState(false);
  const [, setTick] = useState(0);

  const draggedPlantRef = useRef<string | null>(null);
  const plantOriginRef = useRef<number | null>(null);
  const plantedDuringDragRef = useRef<Set<number>>(new Set());
  const harvestOriginRef = useRef<number | null>(null);
  const harvestedDuringDragRef = useRef<Set<number>>(new Set());

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
    setSelectedSlot(null);
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
    setSelectedSlot(slotIdx === selectedSlot ? null : slotIdx);
  };

  const handleSeedClick = (plantId: string) => {
    if (selectedSlot === null) return;
    const slot = garden.slots[selectedSlot];
    if (!slot || slot.plant) return;
    plantSeed(gardenIndex, selectedSlot, plantId);
    setSelectedSlot(null);
  };

  const handleFillAll = (plantId: string) => {
    const altarIdx = altarSlotIndex(garden.upgraded);
    garden.slots.forEach((slot, si) => {
      if (!slot.plant && !(si === altarIdx && garden.hasAltar)) {
        plantSeed(gardenIndex, si, plantId);
      }
    });
    setSelectedSlot(null);
  };

  const handleSeedDragStart = (plantId: string) => {
    if (selectedSlot === null) return;
    draggedPlantRef.current = plantId;
    plantOriginRef.current = selectedSlot;
    plantedDuringDragRef.current = new Set();
    setSeedDragging(true);
  };

  const handleSeedDragEnd = () => {
    draggedPlantRef.current = null;
    plantOriginRef.current = null;
    setDragOverSlot(null);
    plantedDuringDragRef.current = new Set();
    setSeedDragging(false);
  };

  const handleHarvestClick = () => {
    if (selectedSlot === null) return;
    harvest(gardenIndex, selectedSlot);
    setSelectedSlot(null);
  };

  const handleHarvestDragStart = () => {
    if (selectedSlot === null) return;
    harvestOriginRef.current = selectedSlot;
    harvestedDuringDragRef.current = new Set();
    setHarvestDragging(true);
  };

  const handleHarvestDragEnd = () => {
    setHarvestDragging(false);
    harvestOriginRef.current = null;
    harvestedDuringDragRef.current = new Set();
  };

  const handleSlotDragOver = (e: React.DragEvent, slotIdx: number) => {
    if (harvestDragging) {
      e.preventDefault();
      // Until the originally selected cell is harvested, dragging over other ready
      // cells does nothing — only after that does the drag become freeform.
      const restrictTo = harvestOriginRef.current;
      if (restrictTo !== null && slotIdx !== restrictTo) return;

      const slot = garden.slots[slotIdx];
      const plantDef = slot?.plant ? ContentLoader.plant(slot.plant) : null;
      const growMs = plantDef ? calcGrowMs(plantDef, garden) : 0;
      if (
        slot?.plant &&
        growthStage(slot, growMs) === 2 &&
        !harvestedDuringDragRef.current.has(slotIdx)
      ) {
        harvestedDuringDragRef.current.add(slotIdx);
        harvest(gardenIndex, slotIdx);
        if (restrictTo !== null) {
          harvestOriginRef.current = null;
          setSelectedSlot(null);
        }
      }
      return;
    }

    const slot = garden.slots[slotIdx];
    if (!slot || slot.plant || (slotIdx === altarIdx && garden.hasAltar)) return;
    e.preventDefault();

    const plantId = draggedPlantRef.current;
    if (!plantId || plantedDuringDragRef.current.has(slotIdx)) return;

    // Until the originally selected cell is planted, dragging over other empty
    // cells does nothing (and isn't highlighted) — only after that does the drag
    // become freeform.
    const restrictTo = plantOriginRef.current;
    if (restrictTo !== null && slotIdx !== restrictTo) return;

    setDragOverSlot(slotIdx);
    plantedDuringDragRef.current.add(slotIdx);
    plantSeed(gardenIndex, slotIdx, plantId);
    if (restrictTo !== null) {
      plantOriginRef.current = null;
      setSelectedSlot(null);
    }
  };

  const handleSlotDragLeave = () => setDragOverSlot(null);

  const handleSlotDrop = (e: React.DragEvent, slotIdx: number) => {
    e.preventDefault();
    const plantId = draggedPlantRef.current;
    if (!plantId) return;
    const slot = garden.slots[slotIdx];
    if (!slot || slot.plant || (slotIdx === altarIdx && garden.hasAltar)) return;

    const restrictTo = plantOriginRef.current;
    if (restrictTo !== null && slotIdx !== restrictTo) {
      setDragOverSlot(null);
      return;
    }

    if (!plantedDuringDragRef.current.has(slotIdx)) {
      plantedDuringDragRef.current.add(slotIdx);
      plantSeed(gardenIndex, slotIdx, plantId);
      if (restrictTo !== null) {
        plantOriginRef.current = null;
        setSelectedSlot(null);
      }
    }
    setDragOverSlot(null);
  };

  const canUpgrade = !garden.upgraded && coins >= GARDEN_UPGRADE_COST;
  const allSlotsFull = garden.slots.every((s) => !!s.plant);
  const canEnableAltar = garden.hasAltar || !allSlotsFull;
  const biomeLabel = BIOME_LABEL[garden.biome] ?? garden.biome;

  const selectedSlotState = selectedSlot !== null ? garden.slots[selectedSlot] : null;
  const selectedPlantDef = selectedSlotState?.plant
    ? (ContentLoader.plant(selectedSlotState.plant) as PlantDef | undefined)
    : undefined;
  const selectedGrowMs = selectedPlantDef ? calcGrowMs(selectedPlantDef, garden) : 60_000;
  const selectedIsReady =
    !!selectedSlotState?.plant && growthStage(selectedSlotState, selectedGrowMs) === 2;
  const canPlantSelected = !!selectedSlotState && !selectedSlotState.plant;

  return (
    <ModalShell
      onClose={close}
      below={
        harvestDragging || selectedIsReady ? (
          <div css={styles.toolPanel}>
            <div
              css={styles.sickleItem}
              draggable
              onDragStart={handleHarvestDragStart}
              onDragEnd={handleHarvestDragEnd}
              onClick={handleHarvestClick}
            >
              🌾 Собрать
            </div>
          </div>
        ) : seedDragging || canPlantSelected ? (
          <div css={styles.toolPanel}>
            {allPlants.map((p: PlantDef) => {
              const isNative = p.native_biome === 'any' || p.native_biome === garden.biome;
              const canAfford = coins >= p.cost;
              const elemColor = ELEMENT_COLOR[p.element] ?? ELEMENT_COLOR.neutral;
              return (
                <div
                  key={p.id}
                  css={styles.seedRow(isNative, canAfford)}
                  draggable={canAfford}
                  onDragStart={() => handleSeedDragStart(p.id)}
                  onDragEnd={handleSeedDragEnd}
                  onClick={() => canAfford && handleSeedClick(p.id)}
                  title={canAfford ? undefined : 'Не хватает монет'}
                >
                  <span css={styles.seedDot(elemColor)} />
                  <span css={styles.seedName}>
                    {p.name}
                    {isNative && <span css={styles.seedNative}> ★</span>}
                  </span>
                  <span css={styles.seedCost}>{p.cost}💰</span>
                  <button
                    css={styles.seedFillAllBtn}
                    disabled={!canAfford}
                    title="Засеять все пустые слоты"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFillAll(p.id);
                    }}
                  >
                    ×все
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div css={styles.toolPanel} />
        )
      }
    >
      <div css={styles.root}>
        <div css={styles.header}>
          <span css={styles.biomeTag}>{garden.biome}</span>
          <span css={styles.title}>{biomeLabel} сад</span>
          <div css={styles.headerActions}>
            {!garden.upgraded && (
              <button
                css={styles.upgradeBtn}
                onClick={() => upgradeGarden(gardenIndex)}
                disabled={!canUpgrade}
                title={canUpgrade ? '' : `Нужно ${GARDEN_UPGRADE_COST} монет`}
              >
                4×4 — {GARDEN_UPGRADE_COST}💰
              </button>
            )}
            <button
              css={[styles.altarBtn, garden.hasAltar && styles.altarBtnActive]}
              onClick={() => toggleAltar(gardenIndex)}
              disabled={!canEnableAltar}
              title={!canEnableAltar ? 'Освободите хотя бы одно поле' : undefined}
            >
              ⚗
            </button>
          </div>
        </div>

        <div css={styles.grid(side)}>
          {garden.slots.map((slot, si) => {
            const isAltar = si === altarIdx && garden.hasAltar;
            const isSelected = si === selectedSlot;
            const isDragTarget = si === dragOverSlot;

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
                <div
                  key={si}
                  css={[
                    styles.slot,
                    styles.slotEmpty,
                    isSelected && styles.slotSelected,
                    isDragTarget && styles.slotDragOver,
                  ]}
                  onClick={() => handleSlotClick(si)}
                  onDragOver={(e) => handleSlotDragOver(e, si)}
                  onDragLeave={handleSlotDragLeave}
                  onDrop={(e) => handleSlotDrop(e, si)}
                >
                  <span css={styles.slotEmptyPlus}>+</span>
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
                css={[styles.slot, isReady && styles.slotReady, isSelected && styles.slotSelected]}
                onClick={() => handleSlotClick(si)}
                onDragOver={(e) => handleSlotDragOver(e, si)}
                onDragLeave={handleSlotDragLeave}
              >
                <span css={styles.slotIcon}>{STAGE_ICON[stage]}</span>
                <span css={styles.slotLabel}>{plantDef?.name ?? slot.plant}</span>
                {!isReady && <span css={styles.slotTimer}>{formatTime(timeLeft)}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </ModalShell>
  );
}

export default GardenModal;
