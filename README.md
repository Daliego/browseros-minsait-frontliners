# BrowserOS

A conference demo showing microfrontends beyond the typical e-commerce use case. BrowserOS simulates an in-browser operating system: the **shell** opens microfrontend apps as floating WinBox windows containing iframes, and orchestrates all permissions, state, and communication via `window.postMessage`.

> Built for a ~50-minute talk on microfrontends in non-conventional contexts (ERPs, CRMs, hospital systems, deploy tooling).

---

## Architecture

```
┌─────────────────── Shell (localhost:3000) ──────────────────────┐
│                                                                   │
│  App Registry  ──►  WinBox Window Manager  ──►  iframes          │
│                                                                   │
│  Shell State (React Context)                                      │
│    currentUser, permissions, policy, openedApps, notifications    │
│                                                                   │
│  Message Bus (window.addEventListener)                            │
│    APP_READY → SET_APP_CONTEXT                                    │
│    OPEN_APP_REQUESTED → opens new window                          │
│    DEPLOY_STARTED/DONE/REJECTED → DEPLOY_STATUS_UPDATED          │
│    PUSH_NOTIFICATION → Sonner toast + history panel              │
└───────────┬─────────────────────────────┬─────────────────────────┘
            │ iframe                      │ iframe
            ▼                             ▼
  Deploy List App (3001)       Deploy Runner App (3002)
```

Communication is strictly: **Microfrontend → Shell → Microfrontend**. Apps never talk directly.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | Turborepo + pnpm workspaces |
| Apps | Next.js 16 + React 19 + TypeScript |
| Windowing | WinBox.js (floating windows) |
| Communication | `window.postMessage` + type guards |
| Styling | Tailwind v4 + OKLch tokens + shadcn/ui |
| Notifications | Sonner |
| Shared types | `packages/contracts` |
| Shared UI | `packages/ui` |

---

## Getting Started

```bash
# Requires pnpm (https://pnpm.io)
npm install -g pnpm

# Install dependencies
pnpm install

# Start all three apps simultaneously
pnpm dev
```

**Ports:**

| App | URL |
|-----|-----|
| Shell | http://localhost:3000 |
| Deploy List App | http://localhost:3001 |
| Deploy Runner App | http://localhost:3002 |

**Environment variables:** Copy `.env.example` to `apps/shell/.env.local`. Defaults already point to localhost — no changes needed for local dev.

---

## postMessage Event Reference

### Microfrontend → Shell

| Type | Payload | Description |
|------|---------|-------------|
| `APP_READY` | `{ appId }` | Sent on mount; triggers `SET_APP_CONTEXT` |
| `OPEN_APP_REQUESTED` | `{ appId, params? }` | Ask shell to open another app |
| `PUSH_NOTIFICATION` | `{ title, message, variant }` | Show a global toast |
| `DEPLOY_STARTED` | `{ deployId }` | Deploy simulation began |
| `DEPLOY_DONE` | `{ deployId }` | Deploy finished successfully |
| `DEPLOY_REJECTED` | `{ deployId, reason }` | Deploy was blocked |

### Shell → Microfrontend

| Type | Payload | Description |
|------|---------|-------------|
| `SET_APP_CONTEXT` | `{ appId, user, permissions, policy, currentDeployId? }` | Context pushed after `APP_READY` |
| `DEPLOY_STATUS_UPDATED` | `{ deployId, status }` | Status change broadcast to Deploy List |

---

## Permission Model

```typescript
type AppPermission = "deploy:view" | "deploy:write" | "deploy:execute";

// Default permissions
"deploy-list-app":  ["deploy:view", "deploy:write"]
"deploy-runner-app": ["deploy:view", "deploy:execute"]
```

The **Permissions panel** (top bar → shield icon) lets you toggle any permission in real time during the demo.

---

## Friday Mode

Toggle **Simular Sexta-feira** in the Permissions panel. Next time Deploy Runner receives `SET_APP_CONTEXT`, `policy.simulateFriday` will be `true`. Clicking "Iniciar deploy" immediately emits `DEPLOY_REJECTED` with the message:

> "Deploy na sexta-feira detectado. O BrowserOS bloqueou essa tentativa por motivos de paz coletiva."

**Demo tip:** Toggle Friday mode _before_ opening a new Deploy Runner window — context is delivered on `APP_READY`, not continuously.

---

## AI Rules & Skills

- **`AI_RULES.md`** — Architecture constraints for AI-assisted development
- **`skills/create-microfrontend.md`** — Prompt to scaffold a new microfrontend
- **`skills/create-shell-feature.md`** — Prompt to add event handlers, permissions, or UI panels

---

## Demo Script (5 steps)

1. **Open the shell** at localhost:3000. Show the desktop with app cards and the dock.
2. **Open Deploy List App** — click the 📋 card. A WinBox window opens with the iframe.
   - In devtools Network/Console, show `APP_READY` → `SET_APP_CONTEXT` flowing.
3. **Click "Novo Deploy"** — the Deploy List sends `OPEN_APP_REQUESTED`. Shell opens Deploy Runner.
   - Show `SET_APP_CONTEXT` arriving with `deploy:execute` permission → button enables.
4. **Click "Iniciar deploy"** — watch the pipeline steps animate. Toasts appear.
   - Back in Deploy List: the row status updates to `running` then `done` in real time.
5. **Enable Friday mode** (Permissions panel → Simular Sexta-feira). Open a new deploy.
   - Immediate rejection with the Friday message. Error toast. Row shows `rejected`.
