/** Постройка на острове (data/buildings.json). */
export interface BuildingDef {
  id: string;
  name: string;
  type: string;
  w: number;
  h: number;
  cost: number;
  unlock_level: number;
}

/** Заказ от персонажа (data/orders.json). */
export interface OrderDef {
  id: string;
  npc: string;
  required_resources: { resource: string; amount: number }[];
  reward_coins: number;
  reward_xp: number;
  reward_gems?: number;
  expires_hours: number;
}

/** Глубина изо-сортировки для клетки (x,y). */
export const calcBuildingDepth = (x: number, y: number): number => 10 + x + y;
