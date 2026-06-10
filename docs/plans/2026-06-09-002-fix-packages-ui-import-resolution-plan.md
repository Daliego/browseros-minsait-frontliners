---
title: "fix: Resolve @repo/ui import failures from Phase 1"
type: fix
status: active
date: 2026-06-09
---

# fix: Resolve @repo/ui import failures from Phase 1

## Summary

Phase 1 expanded `packages/ui` with 57 shadcn/ui components under `src/components/` and replaced the exports field with a single barrel entry. This broke three things simultaneously: (1) sub-path imports like `@repo/ui/button.tsx` stopped resolving because the wildcard export was removed; (2) the three original Turborepo scaffold files (`button.tsx`, `card.tsx`, `code.tsx`) still live at `packages/ui/src/` with incompatible component interfaces, shadowing nothing in the new barrel but causing interface confusion; (3) `apps/shell/app/page.tsx` is still the old Turborepo template that references the old `Button` with an `appName` prop. This plan restores both import styles (barrel and per-component sub-path), removes the stale scaffold files, and replaces the shell's placeholder page with a minimal BrowserOS-ready version.

---

## Problem Frame

After Phase 1, `@repo/ui` consumers face two failure modes:

- **Sub-path import failure**: `import { Button } from "@repo/ui/button.tsx"` hits a Node.js/TypeScript exports-map resolution miss because the new `package.json` only exposes `"."` and `"./globals.css"`. The original `"./*": "./src/*.tsx"` wildcard was removed.
- **Interface mismatch**: The old `packages/ui/src/button.tsx` (scaffold) exports `Button({ children, className, appName })`. The new shadcn component at `packages/ui/src/components/button.tsx` exports `Button({ className, variant, size, asChild })`. Both files coexist, the old ones are invisible to the barrel but still confuse type-checkers and readers.

Secondary issues uncovered during analysis:
- `packages/ui/tsconfig.json` lists `include: ["src"]` which excludes `__tests__/`, so test files are outside the type-check scope.
- `apps/shell/app/page.tsx` uses the old scaffold `Button` with `appName` prop — this entire page is the Turborepo template, not BrowserOS code. It will be replaced in U5 of the main plan; this fix just needs it non-broken in the interim.

---

## Requirements

- R-FIX-1. Both `import { Button } from "@repo/ui"` (barrel) and `import { Button } from "@repo/ui/button"` (sub-path) resolve correctly.
- R-FIX-2. Old scaffold files (`button.tsx`, `card.tsx`, `code.tsx`) at `packages/ui/src/` root are removed.
- R-FIX-3. `apps/shell/app/page.tsx` does not import broken paths or use the old scaffold component interfaces.
- R-FIX-4. `pnpm check-types` passes across the entire monorepo with no errors.
- R-FIX-5. `pnpm test` continues to pass (21 tests: 13 contracts + 8 UI).

---

## Key Technical Decisions

**Both export styles via a two-entry exports map**

The `packages/ui/package.json` exports field will carry three entries:

```
"exports": {
  ".":              "./src/index.ts"        ← barrel: import { Button } from "@repo/ui"
  "./globals.css":  "./src/globals.css"     ← CSS: @import "@repo/ui/globals.css"
  "./*":            "./src/components/*"    ← sub-path: import { Button } from "@repo/ui/button"
}
```

The wildcard `"./*"` maps to `./src/components/*` (not `./src/*`), so sub-path consumers always reach the new shadcn components, not the stale scaffold files. Node.js export map specificity rules mean `"."` and `"./globals.css"` take precedence over the wildcard for their exact paths.

TypeScript with `moduleResolution: "Bundler"` (apps) and `moduleResolution: "NodeNext"` (library) both honour the exports map. With the wildcard present, `@repo/ui/button` resolves to `./src/components/button.tsx` in both modes.

**Shell page.tsx replaced with a minimal BrowserOS placeholder**

The existing `apps/shell/app/page.tsx` is 100 lines of Turborepo scaffold content. Since Phase 2 (U5) will replace this file entirely with the real BrowserOS desktop, this fix replaces it with a 5-line placeholder that renders nothing but imports nothing broken. This unblocks `check-types` without pre-implementing U5.

**`tsconfig.json` fix: include `__tests__`**

`packages/ui/tsconfig.json` must add `"__tests__"` to the `include` array so test files are type-checked. The current omission means TypeScript silently ignores `__tests__/components.test.tsx`.

---

## Implementation Units

### U1. Clean `packages/ui/src/` root and fix exports + tsconfig

**Goal:** Remove the three stale scaffold files, update the exports map to support both barrel and sub-path imports, and fix the `tsconfig.json` include list.

**Requirements:** R-FIX-1, R-FIX-2, R-FIX-4, R-FIX-5

**Dependencies:** none

**Files:**
- `packages/ui/src/button.tsx` (delete)
- `packages/ui/src/card.tsx` (delete)
- `packages/ui/src/code.tsx` (delete)
- `packages/ui/package.json` (modify — add `"./*"` wildcard entry)
- `packages/ui/tsconfig.json` (modify — add `"__tests__"` to include array)

**Approach:** Delete the three root-level scaffold files. In `package.json`, add `"./*": "./src/components/*"` as a third exports entry alongside the existing `"."` barrel and `"./globals.css"`. In `tsconfig.json`, change `"include": ["src"]` to `"include": ["src", "__tests__"]`.

No changes to `packages/ui/src/index.ts` — the barrel already re-exports all components correctly.

**Test scenarios:**
- After the change, `import { Button } from "@repo/ui"` resolves without TypeScript error (verified by `check-types`)
- After the change, `import { Button } from "@repo/ui/button"` resolves without TypeScript error
- After the change, `import { StatusBadge } from "@repo/ui/status-badge"` resolves to `src/components/status-badge.tsx`
- `pnpm test` still reports 21 tests passed (no regressions from file deletion)
- `__tests__/components.test.tsx` is now type-checked (errors in it surface in `check-types`)

**Verification:** `pnpm --filter @repo/ui check-types` reports no errors. `pnpm test` still passes 21 tests.

---

### U2. Replace `apps/shell/app/page.tsx` with BrowserOS placeholder

**Goal:** Replace the Turborepo scaffold page with a minimal placeholder that imports nothing from `@repo/ui` and does not use old scaffold component interfaces, unblocking `check-types` for the shell app while Phase 2 (U5) builds the real desktop.

**Requirements:** R-FIX-3, R-FIX-4

**Dependencies:** U1

**Files:**
- `apps/shell/app/page.tsx` (replace — drop all Turborepo scaffold content)
- `apps/shell/app/page.module.css` (delete — only used by the scaffold page)

**Approach:** Replace `page.tsx` with a single `export default function Home()` that returns a `<div>BrowserOS loading…</div>`. Remove the `page.module.css` file since it belongs to the scaffold page and is imported nowhere else. No imports from `@repo/ui` or any broken path in this placeholder.

**Test scenarios:**
- `pnpm --filter shell check-types` reports no errors after the replacement
- The shell dev server (`pnpm --filter shell dev`) starts and renders without a runtime crash
- No `page.module.css` reference exists anywhere in `apps/shell/` after deletion

**Verification:** `pnpm check-types` (root turbo task) completes clean across all packages. The shell at `localhost:3000` renders "BrowserOS loading…" without a console error.

---

## Scope Boundaries

### In scope
- Fixing the three root causes identified above (export map, stale files, shell placeholder)
- Making `pnpm check-types` and `pnpm test` pass clean

### Not in scope
- Implementing the real BrowserOS shell UI (that is U5 in the main plan)
- Changing component behaviour or props in any shadcn component
- Migrating existing consumers to the barrel-only import style

### Deferred to Follow-Up Work
- Any further refactor of `packages/ui/src/index.ts` — already correct
- Adding `@hookform/resolvers` or other optional shadcn peer deps — not needed until forms are used

---

## Risks & Dependencies

- **TypeScript exports-map wildcard support**: TypeScript's handling of `"./*"` wildcards in exports maps depends on `moduleResolution`. The shell app uses `"Bundler"` (from `nextjs.json`); `packages/ui` uses `"NodeNext"`. Both honour package.json exports; the wildcard pattern is legal in both. If TypeScript < 5.0 were present this would be a risk, but the repo pins TypeScript 5.9.2.
- **`globals.css` specificity**: The `"./globals.css"` entry must remain before or alongside the wildcard in the exports map. Node.js and TypeScript both give priority to more specific export patterns over wildcards, so ordering in the JSON object is not strictly required — but listing specific entries before the wildcard is conventional and avoids ambiguity.
