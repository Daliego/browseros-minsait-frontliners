# BrowserOS — Apresentação Técnica

> Documento baseado 100% no código real do projeto. Nenhum tipo, função ou arquivo foi inventado.

---

## 1. Mapa dos Principais Blocos de Código

### `packages/contracts/src/types.ts`
Fonte de verdade única para todos os tipos compartilhados. Nenhum app duplica tipos daqui.

---

### Shell (`apps/shell`)

| Arquivo | O que faz |
|---|---|
| `src/features/shell-state/shell-context.tsx` | Define `INITIAL_STATE`, o reducer `shellReducer`, e expõe `ShellProvider` + `useShellState` — é o "kernel" do estado global |
| `src/features/shell-state/types.ts` | Tipos `ShellState`, `ShellAction`, `Deploy`, `Notification` — tudo que o reducer pode receber ou retornar |
| `src/features/apps/app-registry.ts` | Array `appRegistry: AppManifest[]` — lista os 4 apps registrados com URL, ícone, permissões e tamanho de janela |
| `src/features/window-manager/window-manager.ts` | `openAppWindow()` — cria o iframe, instancia o WinBox e registra a janela no estado; `getIframeForApp()` — resolve o elemento `<iframe>` pelo `appId` |
| `src/features/message-bus/shell-message-bus.ts` | `createMessageHandler()` — monta o listener de `postMessage`; valida `event.origin` contra `ALLOWED_ORIGINS` e despacha para os handlers corretos |
| `src/features/message-bus/send-to-app.ts` | `sendToApp()` — envia uma `ShellMessage` para o `contentWindow` do iframe correto, com origin restrita |
| `src/features/message-bus/handlers/on-app-ready.ts` | Responde ao `APP_READY` enviando `SET_APP_CONTEXT` com user, permissions e policy; injeta `pendingDeployId` se houver |
| `src/features/message-bus/handlers/on-open-app-requested.ts` | Valida `deploy:view`, salva `pendingDeployId` no estado e chama `openApp()` |
| `src/features/message-bus/handlers/on-deploy-started.ts` | Atualiza status para `"running"` no estado, exibe toast e avisa deploy-list-app via `sendToApp` |
| `src/features/message-bus/handlers/on-deploy-done.ts` | Atualiza status para `"done"`, exibe toast de sucesso e notifica deploy-list-app |
| `src/features/message-bus/handlers/on-deploy-rejected.ts` | Atualiza status para `"rejected"`, exibe toast de erro e notifica deploy-list-app |
| `src/features/permissions/use-permissions.ts` | `can(appId, permission)` — consulta `state.permissions`; `grantPermission` / `revokePermission` — disparam `SET_PERMISSION` |

---

### Deploy List App (`apps/deploy-list-app`)

| Arquivo | O que faz |
|---|---|
| `src/hooks/use-shell-bridge.ts` | Envia `APP_READY` ao montar; ouve `SET_APP_CONTEXT` e `DEPLOY_STATUS_UPDATED`; expõe `requestNewDeploy()` que dispara `OPEN_APP_REQUESTED` |
| `src/components/deploy-table.tsx` | Tabela de deploys com `StatusBadge` e botão de execução; puro — recebe `deploys[]` e `onRunDeploy` como props |
| `src/data/mock-deploys.ts` | Array inicial `mockDeploys` com 3 entradas (api-service, frontend, worker) em estados distintos |

---

### Deploy Runner App (`apps/deploy-runner-app`)

| Arquivo | O que faz |
|---|---|
| `src/hooks/use-shell-bridge.ts` | Envia `APP_READY` ao montar; ouve `SET_APP_CONTEXT` com `currentDeployId`; expõe `postToShell()` |
| `src/hooks/use-deploy-runner.ts` | Máquina de estados do pipeline: verifica `canDeploy` e `policy.simulateFriday`; executa 3 steps com delay; chama `onDeployStarted/Done/Rejected` |
| `src/types.ts` | `RunnerStatus`, `PipelineStep`, `PIPELINE_STEPS` — os 3 passos: `build`, `tests`, `deploy` |
| `src/components/pipeline-steps.tsx` | Visual dos steps com status `pending / active / done / error` |
| `src/components/log-area.tsx` | Terminal de logs em tempo real |
| `src/components/context-card.tsx` | Exibe user e permissões recebidos do shell |

---

## 2. Fluxo Completo: "Executar Deploy"

O usuário clica em ▶ na linha `d-002` do Deploy List App. Abaixo cada etapa com o arquivo responsável.

```
ETAPA 1 — Clique no botão
  deploy-list-app/src/components/deploy-table.tsx
    → onRunDeploy("d-002") chamado pelo onClick

ETAPA 2 — Emissão da mensagem
  deploy-list-app/src/hooks/use-shell-bridge.ts :: requestNewDeploy()
    → window.parent.postMessage(
        { type: "OPEN_APP_REQUESTED", payload: { appId: "deploy-runner-app", params: { deployId: "d-002" } } },
        "*"
      )

ETAPA 3 — Shell recebe e valida origem
  apps/shell/src/features/message-bus/shell-message-bus.ts :: createMessageHandler()
    → event.origin em ALLOWED_ORIGINS? ✓
    → isMicrofrontendMessage(event.data)? ✓ (type guard de @repo/contracts)
    → despacha para on-open-app-requested

ETAPA 4 — Validação de permissão
  apps/shell/src/features/message-bus/handlers/on-open-app-requested.ts :: onOpenAppRequested()
    → state.permissions["deploy-runner-app"]?.includes("deploy:view") → true
    → dispatch({ type: "SET_PENDING_DEPLOY_ID", payload: { deployId: "d-002" } })
    → openApp("deploy-runner-app")

ETAPA 5 — Abertura da janela
  apps/shell/src/features/window-manager/window-manager.ts :: openAppWindow()
    → cria <iframe src="http://localhost:3002">
    → instancia new WinBox("Deploy Runner", { mount: iframe })
    → dispatch({ type: "ADD_OPENED_APP", ... })

ETAPA 6 — App filho inicializa
  deploy-runner-app/src/hooks/use-shell-bridge.ts (useEffect)
    → window.parent.postMessage({ type: "APP_READY", payload: { appId: "deploy-runner-app" } }, "*")

ETAPA 7 — Shell responde com contexto
  apps/shell/src/features/message-bus/handlers/on-app-ready.ts :: onAppReady()
    → permissions = state.permissions["deploy-runner-app"] → ["deploy:view", "deploy:execute"]
    → payload.currentDeployId = state.pendingDeployId → "d-002"
    → dispatch({ type: "SET_PENDING_DEPLOY_ID", payload: { deployId: null } })  ← limpa o pending
    → sendToApp("deploy-runner-app", { type: "SET_APP_CONTEXT", payload }, getIframe)

ETAPA 8 — Runner recebe contexto e habilita botão
  deploy-runner-app/src/hooks/use-shell-bridge.ts :: handleMessage()
    → isShellMessage(event.data) → type "SET_APP_CONTEXT"
    → setShellContext({ user, permissions, policy, currentDeployId: "d-002" })
    → botão "Iniciar deploy" aparece habilitado (canDeploy = permissions.includes("deploy:execute"))

ETAPA 9 — Usuário clica "Iniciar deploy"
  deploy-runner-app/src/hooks/use-deploy-runner.ts :: startDeploy()
    → policy.simulateFriday? → não → continua
    → canDeploy? → sim → continua
    → onDeployStarted("d-002") → postToShell({ type: "DEPLOY_STARTED", payload: { deployId: "d-002" } })
    → executa 3 steps com delay de 1200ms cada (build → tests → deploy)
    → onDeployDone("d-002") → postToShell({ type: "DEPLOY_DONE", payload: { deployId: "d-002" } })

ETAPA 10 — Shell processa DEPLOY_STARTED
  apps/shell/src/features/message-bus/handlers/on-deploy-started.ts :: onDeployStarted()
    → dispatch UPDATE_DEPLOY_STATUS → status "running"
    → toast.info("Deploy iniciado")
    → sendToApp("deploy-list-app", { type: "DEPLOY_STATUS_UPDATED", payload: { deployId: "d-002", status: "running" } })

ETAPA 11 — Shell processa DEPLOY_DONE
  apps/shell/src/features/message-bus/handlers/on-deploy-done.ts :: onDeployDone()
    → dispatch UPDATE_DEPLOY_STATUS → status "done"
    → toast.success("Deploy concluído")
    → sendToApp("deploy-list-app", { type: "DEPLOY_STATUS_UPDATED", payload: { deployId: "d-002", status: "done" } })

ETAPA 12 — Deploy List atualiza linha
  deploy-list-app/src/hooks/use-shell-bridge.ts :: handleMessage()
    → type "DEPLOY_STATUS_UPDATED" → deployId "d-002" → status "done"
    → setDeploys(prev => prev.map(d => d.id === "d-002" ? { ...d, status: "done" } : d))
    → StatusBadge da linha d-002 re-renderiza como "done"
```

---

## 3. Tipos e Contratos (`packages/contracts/src/types.ts`)

### Tipos base

| Tipo | O que representa |
|---|---|
| `AppId` | Union literal dos 4 apps registrados: `"deploy-list-app" \| "deploy-runner-app" \| "portifolio-app" \| "google"` |
| `AppPermission` | `"deploy:view" \| "deploy:write" \| "deploy:execute" \| "*"` |
| `DeployStatus` | `"pending" \| "running" \| "done" \| "rejected"` |
| `User` | `{ id, name, email, avatarUrl? }` — o usuário simulado |
| `OpenedApp` | `{ appId, windowId, openedAt }` — rastreia janelas abertas no shell |
| `ShellPolicy` | `{ simulateFriday: boolean }` — política de bloqueio |

### Mensagens Filho → Shell (`MicrofrontendMessageType`)

| Tipo | Produzido por | Consumido por | Quando |
|---|---|---|---|
| `APP_READY` | `use-shell-bridge.ts` de qualquer app | `on-app-ready.ts` | App montou no iframe |
| `OPEN_APP_REQUESTED` | `use-shell-bridge.ts` (deploy-list-app) | `on-open-app-requested.ts` | Usuário clica em "executar deploy" |
| `PUSH_NOTIFICATION` | qualquer app | `on-push-notification.ts` | App quer exibir um toast global |
| `DEPLOY_STARTED` | `use-deploy-runner.ts` | `on-deploy-started.ts` | Execução do pipeline começou |
| `DEPLOY_DONE` | `use-deploy-runner.ts` | `on-deploy-done.ts` | Pipeline completou com sucesso |
| `DEPLOY_REJECTED` | `use-deploy-runner.ts` | `on-deploy-rejected.ts` | Bloqueio por sexta-feira ou falta de permissão |

### Mensagens Shell → Filho (`ShellMessageType`)

| Tipo | Produzido por | Consumido por | Quando |
|---|---|---|---|
| `SET_APP_CONTEXT` | `on-app-ready.ts` via `sendToApp()` | `use-shell-bridge.ts` de qualquer app | Resposta ao `APP_READY` |
| `DEPLOY_STATUS_UPDATED` | `on-deploy-started/done/rejected.ts` | `use-shell-bridge.ts` (deploy-list-app) | Status de um deploy muda |

### Type Guards (validação em runtime)

- `isMicrofrontendMessage(data)` — usado em `shell-message-bus.ts`: garante que o payload tem `type` válido antes de fazer switch
- `isShellMessage(data)` — usado em `use-shell-bridge.ts` de cada app: garante que a mensagem veio do shell com formato esperado

---

## 4. Diagrama de Arquitetura

```
┌──────────────────────────────────────────────────────────────────────┐
│                        BROWSER (uma aba)                             │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                    SHELL  (Next.js :3000)                      │  │
│  │                                                                │  │
│  │  ┌─────────────────────┐   ┌──────────────────────────────┐   │  │
│  │  │   ShellProvider     │   │   shell-message-bus.ts       │   │  │
│  │  │   (React Context)   │   │                              │   │  │
│  │  │                     │   │  1. valida event.origin      │   │  │
│  │  │  currentUser        │   │     (ALLOWED_ORIGINS Set)    │   │  │
│  │  │  permissions        │   │  2. valida isMicrofrontend   │   │  │
│  │  │  deploys            │   │     Message() (type guard)   │   │  │
│  │  │  policy             │   │  3. switch → handlers        │   │  │
│  │  │  pendingDeployId    │   └──────────────────────────────┘   │  │
│  │  └─────────────────────┘                                       │  │
│  │                                                                │  │
│  │  ┌──────────────────┐      ┌──────────────────────────────┐   │  │
│  │  │  app-registry.ts │      │   send-to-app.ts             │   │  │
│  │  │  AppManifest[]   │      │   postMessage(msg, origin)   │   │  │
│  │  └──────────────────┘      └──────────────────────────────┘   │  │
│  │                                     ↑                          │  │
│  │  ┌──────────────────┐               │                          │  │
│  │  │ window-manager   │               │ getIframeForApp()        │  │
│  │  │ openAppWindow()  │               │                          │  │
│  │  │ WinBox + iframe  │               │                          │  │
│  │  └──────────────────┘               │                          │  │
│  └───────────────┬────────────────────-┼──────────────────────────┘  │
│                  │                     │                              │
│        postMessage ↓                   │ postMessage ↑                │
│                  │                     │                              │
│  ┌───────────────▼───────────┐  ┌──────▼──────────────────────────┐  │
│  │  DEPLOY-LIST-APP (:3001)  │  │  DEPLOY-RUNNER-APP (:3002)      │  │
│  │  (iframe isolado)         │  │  (iframe isolado)               │  │
│  │                           │  │                                 │  │
│  │  use-shell-bridge.ts      │  │  use-shell-bridge.ts            │  │
│  │  ├─ envia APP_READY       │  │  ├─ envia APP_READY             │  │
│  │  ├─ recebe SET_APP_CTX    │  │  ├─ recebe SET_APP_CONTEXT      │  │
│  │  ├─ recebe STATUS_UPD     │  │  │   (+ currentDeployId)        │  │
│  │  └─ envia OPEN_APP_REQ    │  │  └─ expõe postToShell()         │  │
│  │                           │  │                                 │  │
│  │  deploy-table.tsx         │  │  use-deploy-runner.ts           │  │
│  │  mock-deploys.ts          │  │  ├─ verifica canDeploy           │  │
│  │                           │  │  ├─ verifica simulateFriday     │  │
│  │  localStorage próprio ✓   │  │  ├─ 3 steps com delay 1200ms   │  │
│  │  cookies próprios   ✓     │  │  └─ emite STARTED/DONE/REJECTED │  │
│  └───────────────────────────┘  │                                 │  │
│                                 │  localStorage próprio ✓         │  │
│                                 │  cookies próprios   ✓           │  │
│                                 └─────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                 @repo/contracts                              │    │
│  │  AppId · AppPermission · DeployStatus · User · ShellPolicy  │    │
│  │  MicrofrontendMessageType · ShellMessageType                 │    │
│  │  isMicrofrontendMessage() · isShellMessage()  (type guards) │    │
│  └──────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘

Regra de ouro: App A nunca fala com App B.
Toda mensagem passa pelo shell.
```

---

## 5. Roteiro de Demo — 3 Minutos

Este roteiro maximiza a demonstração de **isolamento + permissões + postMessage** em sequência contínua.

### Preparação (antes de apresentar)
- Todos os apps rodando: `pnpm dev`
- DevTools aberto na aba **Console** do shell (`:3000`)
- Aba **Application → Local Storage** para mostrar isolamento

---

### Roteiro ao vivo

**[0:00–0:30] — Contexto visual**

Mostrar o desktop do BrowserOS com os ícones dos apps. Explicar: "isso é um Next.js rodando no `:3000`. Cada janela que você vai ver é um iframe apontando para outro servidor."

---

**[0:30–1:00] — Abrir Deploy List App e mostrar APP_READY**

Clicar em Deploy List no desktop.  
Mostrar no console do DevTools: a mensagem `APP_READY` enviada por `use-shell-bridge.ts` e a resposta imediata com `SET_APP_CONTEXT`.

> Falar: "O app filho avisou que está pronto. O shell respondeu com o contexto: quem é o usuário, quais permissões esse app tem."

---

**[1:00–1:45] — Executar deploy e mostrar o fluxo completo**

Clicar em ▶ na linha `d-002` (frontend / production / pending).  
Deploy Runner App abre em nova janela WinBox.  
Mostrar no console: `OPEN_APP_REQUESTED` → `SET_PENDING_DEPLOY_ID` → `APP_READY` do runner → `SET_APP_CONTEXT` com `currentDeployId: "d-002"`.  
Clicar "Iniciar deploy" — os 3 steps (build → tests → deploy) rodam.  
Toast aparece no shell. Linha `d-002` no Deploy List muda de `pending` → `running` → `done`.

> Falar: "O runner não atualizou a lista. Ele enviou um evento ao shell. O shell é quem decidiu notificar o Deploy List App. Os dois nunca se falaram diretamente."

---

**[1:45–2:20] — Revogar permissão em tempo real**

No painel do shell, revogar `deploy:execute` do deploy-runner-app.  
Fechar a janela do runner e abrir de novo.  
O botão "Iniciar deploy" aparece desabilitado.

> Falar: "A permissão mudou no shell. Quando o app abriu de novo e enviou APP_READY, o shell mandou um contexto sem `deploy:execute`. O microfrontend não decide — ele apenas exibe o que o shell autoriza."

---

**[2:20–3:00] — Modo sexta-feira**

Restaurar a permissão `deploy:execute`.  
Ativar o toggle "Simular sexta-feira" no painel do shell.  
Tentar executar um deploy.  
O runner exibe: *"Deploy na sexta-feira detectado. O BrowserOS bloqueou essa tentativa por motivos de paz coletiva."*  
Linha volta para `rejected`. Toast de erro aparece no shell.

> Falar: "A política veio no `SET_APP_CONTEXT`. O app respeitou. A lista foi atualizada. Tudo via postMessage — sem chamada direta, sem estado compartilhado."

---

### Por que este roteiro funciona

- Mostra **cada camada do sistema** em ordem: abertura → contexto → execução → notificação cruzada
- Dois pontos de isolamento visíveis: LocalStorage separado (mostrar na aba Application) e sem comunicação direta entre apps
- A demo do toggle de permissão prova em tempo real que o shell é a fonte de verdade
- O modo sexta-feira termina com humor — memorável para a audiência
