# Dragons Game — Claude Rules

## Styling

- Never use the inline `style` prop (e.g. `style={{ color: 'red' }}`).
- Use `css` from `@emotion/react` or `styled` from `@emotion/styled` for all styling.
- For component-level styles, prefer a `const styles = { ... }` object with `css` values defined outside the component.

## Typography

Two fonts only — never use anything else.

**Balsamiq Sans** (accent) — rounded, comic feel. Use for anything that needs to catch the eye:
- Game logo / title
- Window, panel, dialog headings ("Workshop", "Expeditions")
- Button labels ("Buy", "Go", "Collect")
- Dragon, building, item names
- Large popups — "Level Up!", rewards
- Weight: **Bold (700)**. On dark wood — cream fill `#fff8dc` + thin dark shadow/stroke for legibility.

**Nunito** (body & numbers) — clean and even. Use for everything that needs to be read quickly:
- HUD numbers — gold, crystals, XP, timers
- Quest, item, ability descriptions
- Long text — dialogues, tutorials, lore
- Small labels, prices, counters
- Weights: **600/700** for regular text, **800/900** for currency numbers (to make them stand out).

**Rules — don't break the style:**
- Never set long text or small numbers in Balsamiq Sans — it "jumps" and reads poorly at small sizes. That's Nunito's job.
- Never use more than these two fonts.
- Minimum text size in HUD — no less than ~22px at 1080p; button hit area — at least 44px.
- Unified size hierarchy: heading ≈ 40–48px, button ≈ 19–22px, body ≈ 15–16px, HUD numbers ≈ 24–28px.

## Placeholder Art

Real sprites don't exist yet — buildings, nests and dragons render as flat colored
iso-boxes. This is throwaway scaffolding.

- All placeholder visuals (stand-in colors, debug shapes for missing sprites) live in
  one module: `game/shared/placeholderArt.ts`. Never hardcode a placeholder hex color
  inside a sprite/scene file — import a `placeholder*` helper/const instead.
- This is the single chokepoint to delete when real textures land: drop the module and
  replace its call sites. Nothing else should reference placeholder colors.
- Not placeholders (don't move here): permanent UI chrome (loading bar, validity
  highlights) and data-driven colors (terrain `color` from JSON).

## Enum-like Constants

Never use plain string union types for a set of named keys/values:

```ts
// wrong
type ModalKey = 'book' | 'breeding' | 'orders';
modal: 'orders'
```

Instead, declare a `const` object and derive the type with `EnumLiteralsOf`:

```ts
// correct
export const MODAL_KEY = {
  BOOK: 'book',
  BREEDING: 'breeding',
  ORDERS: 'orders',
  INVENTORY: 'inventory',
} as const;
export type ModalKey = EnumLiteralsOf<typeof MODAL_KEY>;

// usage
modal: MODAL_KEY.ORDERS
```

This applies to all sets of named string (or number) constants — modal keys, status codes, event names, etc.
This includes **all domain enums** already declared in `src/types/`: `DRAGON_STAGE`, `ELEMENT`, `RARITY`. Never compare or assign their values with string literals:

```ts
// wrong
dragon.stage === 'adult'
stage: 'baby'

// correct
dragon.stage === DRAGON_STAGE.ADULT
stage: DRAGON_STAGE.BABY
```

`EnumLiteralsOf` is defined in `src/types/enumLiteralsOf.ts`.

## Functions and Exports

- Components and hooks are declared with `function`, helper/utility functions with arrow functions.
- `export default` is always on a separate line — never `export default function Foo()`.
  ```ts
  // correct
  function App() { ... }
  export default App;

  // wrong
  export default function App() { ... }
  ```
- Components are exported as `export default`. Helper functions are exported as named exports (`export const foo = ...`).
- One component per file — never define more than one React component in a single file.
- Component props are always declared as a local `type Props = { ... }`, then used as `function Foo({ bar }: Props)` — never inline the type, never use `interface`, never name it anything other than `Props`.
  ```ts
  // correct
  type Props = { label: string; onClick: () => void };
  function MenuButton({ label, onClick }: Props) { ... }

  // wrong
  function MenuButton({ label, onClick }: { label: string; onClick: () => void }) { ... }
  interface MenuButtonProps { ... }
  ```

## Project Structure

Imports use the `@/*` → `src/*` alias.

**Where does a file go?** — by who uses it: keep it next to its only consumer; when a
second consumer appears, lift it to the nearest folder both share (`game/shared/`,
`ui/shared/`, or — if it crosses the React↔Phaser boundary — `store/`, `types/`, `consts/`).
Don't lift preemptively.

```
src/
  app/      React bootstrap: main.tsx, App.tsx, GlobalStyles.tsx
  game/     PHASER runtime: PhaserGame.tsx, scenes/, objects/, systems/, bridge/, shared/
  ui/       REACT runtime: hud/, island/, modals/, dev/, shared/
  store/    Zustand: slices/, use*Store.ts, types.ts
  types/    domain types read by both runtimes (dragon, island, plant, bridge)
  consts/   technical constants read by both runtimes
  assets/
```

`game/` and `ui/` is a **technology** boundary; split by feature inside each. Phaser objects
never touch React — they talk through the store and `game/bridge/` only.

### Naming

- Components & Phaser classes — `PascalCase`; utils/hooks/slices — `camelCase.ts`.
- Local satellites — fixed names: `styles.ts`, `types.ts`, `helpers.ts`.
- A component gets its own folder only when it has satellites; otherwise a single file.
  Name the main file after the component — never `index.tsx` (`MenuBar/MenuBar.tsx`).
- No barrel `index.ts` files — import from the source (`@/types/dragon`, not `@/types`).
