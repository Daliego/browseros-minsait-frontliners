# Demo Checklist — BrowserOS Conference Presentation

Run through this list 30 minutes before going on stage.

---

## Environment Setup

- [ ] `pnpm install` succeeded (no peer dep errors)
- [ ] All three apps start: `pnpm dev` → check localhost:3000, 3001, 3002
- [ ] `apps/shell/.env.local` exists with correct URLs (see `.env.example`)
- [ ] Browser is on a clean profile (no extensions that block iframes or postMessage)
- [ ] Browser devtools closed (or in a second window — avoids distracting the audience)

---

## Happy Path Flow

- [ ] Shell loads at localhost:3000 with three app cards visible
- [ ] Clicking 📋 opens a WinBox window with Deploy List inside an iframe
- [ ] Deploy List shows 3 rows with mixed statuses
- [ ] Clicking "Novo Deploy" opens Deploy Runner in a second WinBox window
- [ ] Deploy Runner shows the user name and `deploy:execute` badge (green shield)
- [ ] "Iniciar deploy" button is enabled
- [ ] Clicking it triggers the three-step pipeline animation (Build → Tests → Deploy)
- [ ] Toast notifications appear at top-right during each step
- [ ] Back in Deploy List: the row status updates to `done` without refreshing

---

## Friday Blocker Flow

- [ ] Open Permissions panel (shield icon in top bar)
- [ ] Click "Simular Sexta-feira" → turns red with ATIVO badge
- [ ] Close Deploy Runner (existing one won't receive updated policy)
- [ ] Click "Novo Deploy" again → new Deploy Runner window opens
- [ ] Click "Iniciar deploy" → immediate red toast with Friday message
- [ ] Deploy List row shows `rejected`

---

## Permission Revocation Flow (optional bonus demo)

- [ ] Open Permissions panel
- [ ] Find `deploy-runner-app → deploy:execute` and click to revoke
- [ ] Open a new Deploy Runner → button shows "Sem permissão deploy:execute" and is disabled
- [ ] Re-grant the permission → reopen → button enables again

---

## Fallback Preparation

If the live demo fails, have these ready:

- [ ] Screen recording of the complete happy path (2–3 minutes)
- [ ] Screen recording of the Friday blocker
- [ ] Screenshots of: shell desktop, Deploy List table, Deploy Runner with active pipeline
- [ ] Browser tab pre-opened at localhost:3000 (avoids cold start during the talk)

---

## Talking Points by Step

| Step | What to say |
|------|-------------|
| Shell loads | "This is the OS layer. It owns identity, permissions, and policy." |
| First iframe | "The app is isolated in an iframe. It knows nothing about the shell state." |
| APP_READY fires | "The app announces itself. The shell responds with its context." |
| SET_APP_CONTEXT | "Only now does the app know who the user is and what they can do." |
| Deploy runs | "Every event crosses the shell. The list app doesn't know the runner exists." |
| Friday mode | "The shell holds the policy. The app just reacts to what it receives." |
| Permission revoke | "Revoke permissions in real time. No rebuild, no reload." |
