# Frontend refactoring rules

Applies to every change under `HomeHub.Client/src`. The goal is one job per file, small
reusable pieces, and a change that touches one module. ESLint (`eslint.config.js`) enforces the
mechanical limits; Prettier owns formatting. This document covers the judgement calls.

## Budgets

| Unit                  | Budget                                   | When over                       |
| --------------------- | ---------------------------------------- | ------------------------------- |
| Component file        | aim for 200 lines; hard cap 300 (ESLint) | extract subcomponents           |
| Hook file             | 120 lines                                | split by query/mutation concern |
| Any file              | 300 lines (ESLint `max-lines`)           | split the file                  |
| Function / component  | 150 lines (ESLint)                       | extract a function              |
| Parameters            | 4 (ESLint `max-params`)                  | take a props/options object     |
| Nesting               | 3 (ESLint `max-depth`)                   | early returns                   |
| Cyclomatic complexity | 12 (ESLint `complexity`)                 | extract predicates / branches   |

Budgets count code, not blank lines or comments. A file over the ESLint limit is a split signal,
not an exemption.

## Placement

- `src/api/hooks/use<Thing>.ts` — **one hook per file**. Hooks own fetching and mutations. Import
  each hook from its own module; there is no barrel.
- `src/api/clients.ts` — transport and Connect clients. `src/api/keys.ts` — TanStack query keys.
- `src/components/ui/` — feature-agnostic primitives reused across features (Button, Dialog,
  Markdown, …). One component per file.
- `src/features/<feature>/` — feature components, dialogs, and hooks that only that feature uses.
- `src/pages/` — route-level composition only: a page wires hooks to feature components and keeps
  no large markup of its own.
- `src/lib/` — pure helpers; no React, no feature imports.
- `src/gen/` is generated: never edit it, rerun `npm run gen`.

## Rules

1. **One hook per file.** Export exactly the hook; keep its request/draft types beside it. A helper
   two hooks share moves to its own module or stays private.
2. **One public component per file**, named like the file. Private subcomponents are allowed only
   while the file stays in budget.
3. **A component renders; a hook fetches.** Components take data and callbacks as props. A
   component that both fetches and renders a large subtree is two units.
4. **Single responsibility.** Describe the unit in one sentence with no "and". If it needs "and",
   split it.
5. **Extend by composition.** Use `children`, slots, and explicit variants. Several boolean mode
   flags in one component mean it is several components.
6. **Narrow interfaces.** Pass the smallest props (`title`, `onOpen`) rather than whole server
   messages. Type every prop.
7. **Dependency direction:** pages → features → ui; features may use `api`; `ui` never imports
   features or pages; `lib` imports neither React nor features.
8. **State lives at its lowest owner.** Server state goes through TanStack Query hooks; dialogs own
   their form state; cross-page UI state goes to nanostores.
9. **Controlled dialogs.** The parent owns `open`/`onClose`; the dialog owns its form and mutations.
10. **Types:** no `any` (ESLint error), `import type` for type-only imports, export a type only when
    another module needs it.
11. **Formatting is the formatter's job.** Run `npm run format`; do not hand-format.
12. **Behavior-preserving steps.** A refactor ships no feature or visual change. Refactor and
    feature work are separate passes.
13. **No inline functions in JSX.** Name the handler in the component body or module scope and pass
    the reference: `onClick={openNote}`, not `onClick={() => openNote()}`. For per-item handlers use
    a factory outside JSX (`onClick={deleteFor(item)}`) or read the id from the event target. Wrap
    in `useCallback` when identity drives memoisation. `ref` callbacks are exempt. Enforced by
    `react/jsx-no-bind`; existing warnings are paid down as files are touched — a touched file adds
    none.

## Refactoring loop

1. Baseline: `npm run lint`, `npm run typecheck`, `npm run build`. Note the warnings the pass will
   remove.
2. Split in dependency order: pure helpers → hooks → feature components → pages → shell.
3. After each unit: `npm run typecheck`, then `npm run lint` on the touched file.
4. Apply mechanical fixes with `npm run lint:fix` and `npm run format`.
5. Close with the full gate — see Definition of done.

## Definition of done

- Behavior and visuals are unchanged.
- No touched file or function exceeds the ESLint budgets.
- One hook per file; one public component per file; imports point at the owning module.
- No touched file adds `react/jsx-no-bind` warnings; inline JSX handlers in a touched file are
  extracted in the same pass.
- `npm run format:check`, `npm run lint` (zero errors), `npm run typecheck`, and `npm run build`
  all pass.
