# Dragons Game — Claude Rules

## Styling

- Never use the inline `style` prop (e.g. `style={{ color: 'red' }}`).
- Use `css` from `@emotion/react` or `styled` from `@emotion/styled` for all styling.
- For component-level styles, prefer a `const styles = { ... }` object with `css` values defined outside the component.

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
