import type { EnumLiteralsOf } from './enumLiteralsOf';

export const MODAL_KEY = {
  BOOK: 'book',
  BREEDING: 'breeding',
  ORDERS: 'orders',
  INVENTORY: 'inventory',
} as const;
export type ModalKey = EnumLiteralsOf<typeof MODAL_KEY>;
