import type { EnumLiteralsOf } from '@/types/enumLiteralsOf';

export const RENDER_MODE = {
  WIREFRAME: 'wireframe',
  TEXTURED: 'textured',
} as const;

export type RenderMode = EnumLiteralsOf<typeof RENDER_MODE>;

export const DEV_RENDER_MODE_LS_KEY = 'dev_render_mode';

const envDefault: RenderMode =
  import.meta.env.VITE_RENDER_MODE === RENDER_MODE.TEXTURED
    ? RENDER_MODE.TEXTURED
    : RENDER_MODE.WIREFRAME;

const stored = localStorage.getItem(DEV_RENDER_MODE_LS_KEY);
export const CURRENT_RENDER_MODE: RenderMode =
  stored === RENDER_MODE.TEXTURED || stored === RENDER_MODE.WIREFRAME ? stored : envDefault;
