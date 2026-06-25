import type Phaser from 'phaser';
import type { DragonDef, BreedRecipe } from '@/types/dragon';
import type { PlantDef } from '@/types/plant';
import type { IslandDef, TerrainDef } from '@/types/island';
import type { BuildingDef } from '@game/shared/building';

class ContentLoaderImpl {
  private dragons = new Map<string, DragonDef>();
  private plants = new Map<string, PlantDef>();
  private recipes: BreedRecipe[] = [];
  private islands = new Map<string, IslandDef>();
  private buildings = new Map<string, BuildingDef>();
  private terrain: Record<string, TerrainDef> = {};

  init(scene: Phaser.Scene): void {
    (scene.cache.json.get('dragons') as DragonDef[] | undefined)?.forEach((d) =>
      this.dragons.set(d.id, d),
    );
    (scene.cache.json.get('plants') as PlantDef[] | undefined)?.forEach((p) =>
      this.plants.set(p.id, p),
    );
    this.recipes = (scene.cache.json.get('breeding') as BreedRecipe[] | undefined) ?? [];
    (scene.cache.json.get('islands') as IslandDef[] | undefined)?.forEach((i) =>
      this.islands.set(i.id, i),
    );
    (scene.cache.json.get('buildings') as BuildingDef[] | undefined)?.forEach((b) =>
      this.buildings.set(b.id, b),
    );
    this.terrain =
      (scene.cache.json.get('terrain') as Record<string, TerrainDef> | undefined) ?? {};

    if (import.meta.env.DEV) this.validate();
  }

  private validate(): void {
    const dragonIds = new Set(this.dragons.keys());
    const plantIds = new Set(this.plants.keys());

    const seenDragons = new Set<string>();
    for (const d of this.dragons.values()) {
      if (seenDragons.has(d.id)) console.error(`[ContentLoader] дубль dragon id: "${d.id}"`);
      seenDragons.add(d.id);
    }
    const seenPlants = new Set<string>();
    for (const p of this.plants.values()) {
      if (seenPlants.has(p.id)) console.error(`[ContentLoader] дубль plant id: "${p.id}"`);
      seenPlants.add(p.id);
    }

    for (const r of this.recipes) {
      if (!dragonIds.has(r.parent_1))
        console.error(`[ContentLoader] рецепт "${r.id}": parent_1 "${r.parent_1}" не найден`);
      if (!dragonIds.has(r.parent_2))
        console.error(`[ContentLoader] рецепт "${r.id}": parent_2 "${r.parent_2}" не найден`);
      if (!dragonIds.has(r.result))
        console.error(`[ContentLoader] рецепт "${r.id}": result "${r.result}" не найден`);
      for (const { plant } of r.required_plants) {
        if (!plantIds.has(plant))
          console.error(`[ContentLoader] рецепт "${r.id}": required_plant "${plant}" не найден`);
      }
      if (r.boost_plant && !plantIds.has(r.boost_plant.plant))
        console.error(
          `[ContentLoader] рецепт "${r.id}": boost_plant "${r.boost_plant.plant}" не найден`,
        );
    }
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

  findBreedingRecipe(parentAId: string, parentBId: string): BreedRecipe | undefined {
    return this.recipes.find(
      (r) =>
        (r.parent_1 === parentAId && r.parent_2 === parentBId) ||
        (r.parent_1 === parentBId && r.parent_2 === parentAId),
    );
  }

  island(id: string): IslandDef | undefined {
    return this.islands.get(id);
  }

  building(id: string): BuildingDef | undefined {
    return this.buildings.get(id);
  }

  terrainOf(char: string): TerrainDef | undefined {
    return this.terrain[char];
  }

  allPlants(): PlantDef[] {
    return [...this.plants.values()];
  }

  allBuildings(): BuildingDef[] {
    return [...this.buildings.values()];
  }
}

const ContentLoader = new ContentLoaderImpl();

export default ContentLoader;
