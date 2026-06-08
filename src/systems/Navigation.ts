import Phaser from 'phaser';

/**
 * Централизованный менеджер навигации между сценами.
 * Инициализируется один раз из UIScene (`Navigation.init(this)`).
 * Убирает разбросанные `this.scene.start(...)` по всему коду.
 */
const MODAL_KEYS = ['BookScene', 'MarketScene', 'BreedingScene'];

class NavigationManager {
  private scenePlugin!: Phaser.Scenes.ScenePlugin;

  init(scene: Phaser.Scene): void {
    this.scenePlugin = scene.scene;
  }

  private closeAllModals(): void {
    for (const key of MODAL_KEYS) {
      if (this.scenePlugin.isActive(key)) {
        this.scenePlugin.stop(key);
      }
    }
  }

  openModal(key: string): void {
    this.closeAllModals();
    this.scenePlugin.launch(key);
    this.scenePlugin.bringToTop('UIScene');
  }

  closeModal(key: string): void {
    this.scenePlugin.stop(key);
  }

  gotoIsland(islandId: string): void {
    this.closeAllModals();
    this.scenePlugin.stop('MapScene');
    this.scenePlugin.launch('IslandScene', { islandId });
    this.scenePlugin.bringToTop('UIScene');
  }

  gotoMap(): void {
    this.closeAllModals();
    this.scenePlugin.stop('IslandScene');
    this.scenePlugin.launch('MapScene');
    this.scenePlugin.bringToTop('UIScene');
  }
}

export const Navigation = new NavigationManager();
