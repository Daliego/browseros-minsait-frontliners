# Skill: Create a New Microfrontend

Use this prompt to scaffold a new microfrontend that correctly integrates with the BrowserOS shell.

---

## Prompt Template

```
Create a new microfrontend for BrowserOS named "<APP_NAME>".

Rules from AI_RULES.md apply. Summary:
- Scaffold at apps/<app-id>/ as a Next.js app
- Port: <PORT> (add `"dev": "next dev --port <PORT>"` to scripts)
- No shell chrome (no top nav, no global layout)
- Import @repo/ui/globals.css in app/globals.css
- Import types from @repo/contracts only

Files to create:
- apps/<app-id>/package.json
- apps/<app-id>/tsconfig.json
- apps/<app-id>/next.config.js
- apps/<app-id>/postcss.config.mjs
- apps/<app-id>/app/globals.css
- apps/<app-id>/app/layout.tsx  (minimal, className="dark" on html)
- apps/<app-id>/app/page.tsx
- apps/<app-id>/src/hooks/use-shell-bridge.ts
- apps/<app-id>/src/components/  (app-specific components)

Shell bridge hook must:
1. On mount: window.parent.postMessage({ type: "APP_READY", payload: { appId: "<app-id>" } }, "*")
2. Listen for message events, call isShellMessage(event.data) from @repo/contracts
3. On SET_APP_CONTEXT: store user, permissions, policy in React state
4. Expose helpers to send messages to shell (e.g. PUSH_NOTIFICATION, OPEN_APP_REQUESTED)

Add the app manifest to apps/shell/src/features/apps/app-registry.ts:
{
  appId: "<app-id>",
  name: "<Display Name>",
  description: "<one line>",
  icon: "<emoji>",
  url: process.env.NEXT_PUBLIC_<APP_CONST>_URL ?? "http://localhost:<PORT>",
  requiredPermissions: ["deploy:view"],
  defaultWindowSize: { width: 720, height: 480 },
}

Add default permissions to INITIAL_STATE in apps/shell/src/features/shell-state/shell-context.tsx:
"<app-id>": ["deploy:view"],

Add the AppId to packages/contracts/src/types.ts:
export type AppId = "deploy-list-app" | "deploy-runner-app" | "<app-id>";

Add env var to .env.example:
NEXT_PUBLIC_<APP_CONST>_URL=http://localhost:<PORT>

Do NOT:
- Add any navigation chrome inside the microfrontend
- Communicate directly with other microfrontends
- Hard-code message type strings (import from @repo/contracts)
- Use Module Federation or single-spa
```

---

## Checklist After Scaffolding

- [ ] `pnpm install` succeeds
- [ ] `pnpm --filter <app-id> check-types` passes
- [ ] App visible in shell desktop app list
- [ ] Opening app sends `APP_READY` (verify in devtools console)
- [ ] Shell responds with `SET_APP_CONTEXT` visible in devtools
- [ ] App renders with correct dark theme (no flash of white)
