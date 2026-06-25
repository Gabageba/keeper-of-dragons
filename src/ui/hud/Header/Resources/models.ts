import type { EnumLiteralsOf } from '@/types/enumLiteralsOf';

export const RESOURCE_WIDTH = {
  LG: 'large',
  SM: 'small',
} as const;

export type ResourceWidth = EnumLiteralsOf<typeof RESOURCE_WIDTH>;
