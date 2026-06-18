# Skill: Create a New Shell Feature

Use this prompt to add a new feature to the BrowserOS shell (new event handler, new permission, new UI panel).

---

## Adding a New postMessage Event Handler

```
Add a new message handler to the BrowserOS shell for a new event type "<EVENT_TYPE>".

Steps:
1. Add the event type to packages/contracts/src/messages.ts as a new discriminated union member.
   - If microfrontend → shell: add to MicrofrontendMessage union
   - If shell → microfrontend: add to ShellMessage union
   - Update MICROFRONTEND_MESSAGE_TYPES or SHELL_MESSAGE_TYPES arrays accordingly

2. Create the handler at:
   apps/shell/src/features/message-bus/handlers/on-<event-kebab>.ts
   
   Handler signature:
   export function on<EventPascal>(
     message: <EventType>Message,
     state: ShellState,  // only if state is needed
     dispatch: Dispatch<ShellAction>,
     getIframe: (appId: AppId) => HTMLIFrameElement | undefined
   ) { ... }

3. Register in apps/shell/src/features/message-bus/shell-message-bus.ts:
   case "<EVENT_TYPE>":
     on<EventPascal>(msg, state, dispatch, getIframe);
     break;

4. If the handler needs new shell state: add a field to ShellState in
   apps/shell/src/features/shell-state/types.ts and a corresponding action
   to ShellAction. Handle it in the reducer in shell-context.tsx.

Do NOT:
- Hard-code message type strings inside the handler
- Allow microfrontends to call shell actions directly
- Bypass the isMicrofrontendMessage() type guard
```

---

## Adding a New Permission

```
Add a new permission "<scope:action>" to BrowserOS.

1. Add to AppPermission union in packages/contracts/src/types.ts
2. Add to permissionColorMap in packages/ui/src/components/permission-badge.tsx
3. Grant/revoke via the permissions panel (no code change needed — it reads ALL_PERMISSIONS array
   in apps/shell/src/features/permissions/permissions-panel.tsx — add the new permission there)
4. Check the permission with: can(appId, "<scope:action>") from usePermissions()
```

---

## Adding a New Shell UI Panel

```
Add a new panel to the BrowserOS shell UI.

Pattern to follow: apps/shell/src/features/notifications/notifications-panel.tsx

1. Create apps/shell/src/features/<feature>/<feature>-panel.tsx
   - Panel is absolutely positioned (top-12 right-4 or similar)
   - Uses bg-[oklch(0.18_0.01_260)]/95 backdrop-blur-xl for the glass effect
   - Includes a header with icon + title + close button
   - z-index: z-50

2. Add a toggle button to top-bar.tsx or dock.tsx

3. Wire show/hide state in apps/shell/app/page.tsx using useState

The panel must NOT:
- Manage its own open/close state internally (controlled by parent)
- Overlap WinBox windows (WinBox z-index is ~1000; panels should close on app open if they do)
```
