import { create } from 'zustand';
import type { OfflineSummary } from '@/types/save';
import type { ModalKey } from '@/types/modal';

interface ActionPanelData {
  uid: string;
  name: string;
  buildingId: string;
}

interface GardenPanelData {
  uid: string;
  gardenIndex: number;
}

interface DragonPanelData {
  nestUid: string;
  dragonUid: string;
}

interface ClearPanelData {
  cx: number;
  cy: number;
  cost: number;
}

/**
 * Эфемерное состояние UI поверх canvas (модалки, панели, позиция ghost-кнопок).
 * НЕ сохраняется. Phaser пишет сюда через колбэки (правило 1 архитектуры).
 */
interface UIState {
  gameReady: boolean;
  loadingProgress: number;
  activeModal: ModalKey | null;
  buildPanelOpen: boolean;
  devMenuOpen: boolean;
  actionPanel: ActionPanelData | null;
  clearPanel: ClearPanelData | null;
  gardenPanel: GardenPanelData | null;
  dragonPanel: DragonPanelData | null;
  ghostControls: { x: number; y: number; movingUid?: string } | null;
  offlineSummary: OfflineSummary | null;
  toastMessage: string | null;

  setGameReady: (v: boolean) => void;
  setLoadingProgress: (v: number) => void;
  openModal: (modal: ModalKey) => void;
  closeModal: () => void;
  toggleBuildPanel: () => void;
  closeBuildPanel: () => void;
  toggleDevMenu: () => void;
  setActionPanel: (data: ActionPanelData | null) => void;
  setClearPanel: (data: ClearPanelData | null) => void;
  setGardenPanel: (data: GardenPanelData | null) => void;
  setDragonPanel: (data: DragonPanelData | null) => void;
  setGhostControls: (pos: { x: number; y: number; movingUid?: string } | null) => void;
  setOfflineSummary: (data: OfflineSummary | null) => void;
  showToast: (text: string, durationMs?: number) => void;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useUIStore = create<UIState>((set) => ({
  gameReady: false,
  loadingProgress: 0,
  activeModal: null,
  buildPanelOpen: false,
  devMenuOpen: false,
  actionPanel: null,
  clearPanel: null,
  gardenPanel: null,
  dragonPanel: null,
  ghostControls: null,
  offlineSummary: null,
  toastMessage: null,

  setGameReady: (v) => set({ gameReady: v }),
  setLoadingProgress: (v) => set({ loadingProgress: v }),
  openModal: (modal) => set({ activeModal: modal, buildPanelOpen: false }),
  closeModal: () => set({ activeModal: null }),
  toggleBuildPanel: () => set((s) => ({ buildPanelOpen: !s.buildPanelOpen })),
  closeBuildPanel: () => set({ buildPanelOpen: false }),
  toggleDevMenu: () => set((s) => ({ devMenuOpen: !s.devMenuOpen })),
  setActionPanel: (data) => set({ actionPanel: data }),
  setClearPanel: (data) => set({ clearPanel: data }),
  setGardenPanel: (data) => set({ gardenPanel: data, actionPanel: null }),
  setDragonPanel: (data) => set({ dragonPanel: data, actionPanel: null }),
  setGhostControls: (pos) => set({ ghostControls: pos }),
  setOfflineSummary: (data) => set({ offlineSummary: data }),
  showToast: (text, durationMs = 2000) => {
    if (toastTimer !== null) clearTimeout(toastTimer);
    set({ toastMessage: text });
    toastTimer = setTimeout(() => {
      set({ toastMessage: null });
      toastTimer = null;
    }, durationMs);
  },
}));
