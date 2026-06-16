# AI_RULES.md — BrowserOS Architecture Constraints

Rules for AI-assisted development on the BrowserOS monorepo. Apply these whenever generating, reviewing, or modifying code.

---

## Monorepo Layout

```
apps/
  shell/              ← The OS. Orchestrates everything.
  deploy-list-app/    ← Microfrontend (port 3001)
  deploy-runner-app/  ← Microfrontend (port 3002)
packages/
  contracts/          ← Shared types and message contracts
  ui/                 ← Shared shadcn/ui components + design tokens
```

**Rule:** New microfrontends go in `apps/<name>/`. New shared types go in `packages/contracts/`. New shared UI components go in `packages/ui/`. Never duplicate types across apps.

---

## Shell is the Orchestrator

The shell is the source of truth. It owns:
- User identity
- Permissions (who can do what)
- Policy (e.g., Friday blocker)
- Global state (open apps, deploys, notifications)
- All cross-app communication routing

**Rule:** Microfrontends never access shell state directly. They receive state via `SET_APP_CONTEXT` and request actions via `postMessage`.

---

## postMessage is the Only Communication Channel

```
Microfrontend A → Shell → Microfrontend B
```

**Rule:** Microfrontends NEVER communicate directly with each other. All messages go through the shell's message bus.

---

## Mandatory Handshake

Every microfrontend MUST follow this pattern on mount:

```typescript
// On mount:
window.parent.postMessage({ type: "APP_READY", payload: { appId: "my-app" } }, "*");

// Listen for:
window.addEventListener("message", (event) => {
  if (isShellMessage(event.data) && event.data.type === "SET_APP_CONTEXT") {
    // Store user, permissions, policy from payload
  }
});
```

**Rule:** Never skip `APP_READY`. The shell won't send context until it hears it.

---

## Message Type Strings Come Only from `packages/contracts`

```typescript
// ✅ Correct
import { type MicrofrontendMessage } from "@repo/contracts";

// ❌ Wrong — never hardcode message type strings
window.parent.postMessage({ type: "APP_READY", ... });  // only if type is from contracts
```

**Rule:** All event type strings are defined as TypeScript discriminated union members in `packages/contracts/src/messages.ts`. Import them. Never string-literal message types outside contracts.

---

## Permissions are Enforced by the Shell

```typescript
// Shell-side permission check
const can = (appId, permission) => state.permissions[appId]?.includes(permission) ?? false;
```

**Rule:** Microfrontends receive their permissions in `SET_APP_CONTEXT.permissions[]`. They may use this to show/hide UI. They MUST NOT be the final authority — the shell validates before acting.

---

## No Backend, No Real Auth

This is a demo. There is no backend, no database, and no real authentication.

**Rule:** Never add `fetch()` calls to external APIs, localStorage persistence, or real authentication flows. Keep all state in React context (shell) and component state (microfrontends).

---

## Tailwind v4 Everywhere

The design token system uses Tailwind v4 with OKLch variables defined in `packages/ui/src/globals.css`.

**Rule:** Import `@repo/ui/globals.css` in each app's `globals.css`. Use the `postcss.config.mjs` with `@tailwindcss/postcss`. Never mix Tailwind v3 and v4 syntax.

---

## No Module Federation

**Rule:** Never use Module Federation, single-spa, or any micro-frontend framework. The architecture is iframes + postMessage only.
