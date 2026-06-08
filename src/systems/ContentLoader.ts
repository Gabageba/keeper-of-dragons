import type Phaser from 'phaser';
import type { DragonDef, PlantDef, BreedRecipe } from '@/types';

/**
 * ContentLoader — единая точка доступа к статичному контенту (JSON),
 * загруженному в PreloadScene через this.load.json(...).
 * Индексирует по id для быстрого поиска. См. docs/tasks/02-data-content-layer.md.
 */
class ContentLoaderImpl {
  private dragons = new Map<string, DragonDef>();
  private plants = new Map<string, PlantDef>();
  private recipes: BreedRecipe[] = [];

  /** Вызывается из create() после загрузки JSON в cache. */
  init(scene: Phaser.Scene): void {
    (scene.cache.json.get('dragons') as DragonDef[] | undefined)?.forEach((d) => this.dragons.set(d.id, d));
    (scene.cache.json.get('plants') as PlantDef[] | undefined)?.forEach((p) => this.plants.set(p.id, p));
    this.recipes = (scene.cache.json.get('breeding') as BreedRecipe[] | undefined) ?? [];
  }

  dragon(id: string): DragonDef | undefined {
    return this.dragons.get(id);
  }

  plant(id: string): PlantDef | undefined {
    return this.plants.get(id);
  }

  allDragons(): DragonDef[] {
    return [...this.dragons.values()];
  }

  /** Находит рецепт для пары родителей (порядок не важен). */
  findRecipe(parentA: string, parentB: string): BreedRecipe | undefined {
    return this.recipes.find(
      (r) =>
        (r.parent_1 === parentA && r.parent_2 === parentB) ||
        (r.parent_1 === parentB && r.parent_2 === parentA),
    );
  }
}

export const ContentLoader = new ContentLoaderImpl();
