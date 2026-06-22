---
title: "feat: Register external URL as shell iframe app"
status: active
created: 2026-06-17
type: feat
---

# feat: Register external URL as shell iframe app

## Governing Skill

> **MUST read `.claude/skills/create-microfrontend.md` before making any edits** — this is required by CLAUDE.md for every shell app addition.

This plan covers the **external-URL variant** of that skill: no new Next.js app is scaffolded. The skill's checklist items that require a running microfrontend (`APP_READY` handshake, `SET_APP_CONTEXT` verification, dark-theme check) are **not applicable** here and are explicitly skipped. All registry and contracts checklist items from the skill apply in full.

---

## Context

BrowserOS is a demo shell that opens microfrontends in WinBox iframe windows. The `portifolio-app` already demonstrates that any public URL can be loaded as a shell app — no Next.js scaffold, shell bridge hook, or postMessage handling is needed. This plan provides a reusable, fill-in-the-blanks template: supply `APP_ID`, `APP_NAME`, `APP_URL`, and `APP_ICON`, run the plan, and a new app entry appears on the desktop.

---

## Template Variables

Fill these in before executing:

| Variable | Description | Example |
|---|---|---|
| `{{APP_ID}}` | kebab-case slug, unique per app | `my-external-app` |
| `{{APP_NAME}}` | Display name shown on desktop & window title | `My External App` |
| `{{APP_URL}}` | Full URL loaded in the iframe | `https://example.com` |
| `{{APP_ICON}}` | Emoji icon shown on app card | `🌐` |
| `{{APP_DESCRIPTION}}` | One-line description | `Opens example.com in a window` |

---

## Scope

**In scope:** Add the app to contracts, registry, and shell permissions defaults — the three registry steps from `.claude/skills/create-microfrontend.md`.

**Out of scope:**
- Creating a new `apps/` directory, Next.js scaffold, or Turborepo port config (external URL, not a local app)
- Shell bridge hook / `use-shell-bridge.ts` (external site has no access to the shell bridge)
- `ALLOWED_ORIGINS` entry (only needed if the external site sends `postMessage` back to the shell — add it manually if required)
- `.env.example` env-var entry (URL is hardcoded in the manifest, not env-driven, matching the `portifolio-app` precedent)

---

## Skill Checklist Mapping

Items from `.claude/skills/create-microfrontend.md`:

| Checklist item | Status for this plan |
|---|---|
| Add `AppId` to `packages/contracts/src/types.ts` | ✅ U1 |
| Add manifest to `apps/shell/src/features/apps/app-registry.ts` | ✅ U2 |
| Add default permissions to `shell-context.tsx` INITIAL_STATE | ✅ U3 |
| Scaffold `apps/<app-id>/` Next.js app files | ⏭ Skipped — external URL |
| `use-shell-bridge.ts` hook | ⏭ Skipped — external URL |
| `.env.example` env var | ⏭ Skipped — URL hardcoded in manifest |
| `pnpm install` succeeds | ⏭ Skipped — no new package |
| `pnpm --filter <app-id> check-types` passes | ⏭ Skipped — no new package |
| App visible in shell desktop app list | ✅ Covered in U2 verification |
| `APP_READY` sent on open (devtools) | ⏭ Not applicable — external site |
| Shell responds with `SET_APP_CONTEXT` (devtools) | ⏭ Not applicable — external site |
| App renders with correct dark theme | ⏭ Not applicable — external site |

---

## Key Technical Decisions

**Why extend `AppId` in contracts?** `AppId` is a literal union type used as a key in `ShellState.permissions`, `OpenedApp`, and `sendToApp`. Adding the new ID here gives TypeScript coverage across all uses without touching the message bus. This is step 3 in the skill's manifest instructions.

**Why `"*"` as default permission?** External apps don't participate in deploy flows. The wildcard grants access without requiring the permissions panel to be configured before the demo. The skill defaults to `["deploy:view"]` for first-party apps; the wildcard is the right choice for external URLs.

**Why not add to `ALLOWED_ORIGINS`?** `ALLOWED_ORIGINS` only matters for incoming `postMessage` events. An iframe that only *displays* content and never posts messages back doesn't need a registered origin. The skill's scaffold sets up `postMessage` handlers — those are unnecessary here.

---

## Implementation Units

### U1. Add `{{APP_ID}}` to the `AppId` union

**Goal:** Make TypeScript aware of the new app across the codebase (skill step: "Add the AppId to packages/contracts/src/types.ts").

**Files:**
- `packages/contracts/src/types.ts`

**Approach:** Append `"{{APP_ID}}"` to the existing `AppId` union literal. The current value as of writing is `"deploy-list-app" | "deploy-runner-app" | "portifolio-app"`.

**Patterns to follow:** Existing entries in `packages/contracts/src/types.ts` line 1.

**Test scenarios:** `Test expectation: none — pure type-level change; TypeScript enforces correctness at compile time.`

**Verification:** `pnpm typecheck` from repo root passes with no new errors.

---

### U2. Add the app manifest to the shell registry

**Goal:** The app card appears on the desktop and can be opened as a WinBox iframe window (skill step: "Add the app manifest to `apps/shell/src/features/apps/app-registry.ts`").

**Dependencies:** U1

**Files:**
- `apps/shell/src/features/apps/app-registry.ts`

**Approach:** Append an entry to the `appRegistry` array. Key differences from the skill's first-party template:
- `url` is the literal `{{APP_URL}}` string (not an env var), matching the `portifolio-app` precedent.
- `requiredPermissions` is `["*"]` (not `["deploy:view"]`), since this is not a deploy-flow app.
- `defaultWindowSize` can be adjusted per app; `{ width: 800, height: 600 }` is a safe default for most external pages.

**Patterns to follow:** `portifolio-app` entry in `apps/shell/src/features/apps/app-registry.ts`.

**Test scenarios:**
- App card with icon `{{APP_ICON}}` and label `{{APP_NAME}}` appears on the desktop immediately after the shell loads.
- Clicking the card once opens a WinBox window; the iframe `src` matches `{{APP_URL}}`.
- Clicking the card a second time focuses the existing window — no duplicate opens (deduplication is in `window-manager.ts`).
- The app icon appears in the dock while the window is open.
- Closing the WinBox window removes the app from the dock.

**Verification:** Start the shell with `pnpm dev --filter=shell`, open `http://localhost:3000`, and confirm the card and window behavior above.

---

### U3. Add default permissions in shell initial state

**Goal:** `ShellState.permissions` includes `{{APP_ID}}` so the permissions panel displays it and TypeScript is satisfied (skill step: "Add default permissions to INITIAL_STATE in `apps/shell/src/features/shell-state/shell-context.tsx`").

**Dependencies:** U1

**Files:**
- `apps/shell/src/features/shell-state/shell-context.tsx`

**Approach:** Add `"{{APP_ID}}": ["*"]` to the `permissions` field of `INITIAL_STATE`. The skill defaults to `["deploy:view"]` for first-party apps; external apps use `["*"]` so no panel configuration is needed before the demo.

**Patterns to follow:** `"portifolio-app": ["*"]` in `apps/shell/src/features/shell-state/shell-context.tsx`.

**Test scenarios:**
- The permissions panel renders a row for `{{APP_ID}}` with the wildcard permission shown.
- No TypeScript error from `Partial<Record<AppId, AppPermission[]>>` after the `AppId` union is extended in U1.

**Verification:** Permissions panel opens without errors; `{{APP_ID}}` row is visible.

---

## Verification (end-to-end)

Run through the applicable items from the skill's post-scaffold checklist:

1. `pnpm typecheck` from repo root — no new errors.
2. Start the shell: `pnpm dev --filter=shell`.
3. Open `http://localhost:3000`.
4. Confirm `{{APP_NAME}}` card with icon `{{APP_ICON}}` appears on the desktop.
5. Click the card — WinBox window opens, iframe loads `{{APP_URL}}`.
6. Open the permissions panel — `{{APP_ID}}` row appears with `*` permission.
7. Click the card again — existing window is focused, no duplicate opened.
8. Close the window — app disappears from the dock.
