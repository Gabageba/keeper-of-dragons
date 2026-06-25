import type { EnumLiteralsOf } from './enumLiteralsOf';

export const MODAL_KEY = {
  DRAGONS_BOOK: 'dragons-book',
  BREEDING: 'breeding',
  ORDERS: 'orders',
  INVENTORY: 'inventory',
  SHOP: 'shop',
} as const;
export type ModalKey = EnumLiteralsOf<typeof MODAL_KEY>;
