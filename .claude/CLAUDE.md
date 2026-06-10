# BrowserOS — CLAUDE.md

## Visão geral do projeto

BrowserOS é uma aplicação demonstrativa criada para uma palestra sobre microfrontends em contextos não convencionais. O projeto simula um mini sistema operacional dentro do navegador, onde um **shell frontend** centraliza abertura de apps, permissões, autenticação simulada, estado, comunicação e notificações globais.

O objetivo não é produção: é uma **demo funcional e didática** para mostrar arquitetura de microfrontends com iframes, postMessage e orquestração via shell.

---

## Stack

- **Next.js** + **React** + **TypeScript**
- **Turborepo** (monorepo)
- **WinBox.js** (gerenciador de janelas no browser)
- **iframes** + **window.postMessage** (isolamento e comunicação)
- **shadcn/ui** + **Tailwind CSS**
- **pnpm**
- **ESLint** + **Prettier**

---

## Estrutura do monorepo

```
apps/
  shell/              # App principal — o "sistema operacional"
  deploy-list-app/    # Microfrontend de listagem de deploys
  deploy-runner-app/  # Microfrontend de execução de deploy

packages/
  ui/                 # Componentes compartilhados (shadcn/ui)
  contracts/          # Tipos e contratos TypeScript compartilhados
  config/             # Configs compartilhadas (ESLint, TS, Tailwind)
```

---

## Apps

### Shell (`apps/shell`)

O shell é a fonte de verdade. Ele é responsável por:

- Renderizar o desktop com os apps disponíveis
- Abrir microfrontends em janelas via **WinBox.js**
- Carregar cada app dentro de um **iframe**
- Controlar permissões simuladas
- Armazenar e sincronizar estado global (`ShellState`)
- Receber e enviar mensagens via `postMessage`
- Exibir notificações globais (toasts)
- Intermediar toda comunicação entre microfrontends

O shell nunca permite que microfrontends se comuniquem diretamente entre si.

#### Estado global do shell

```ts
type ShellState = {
  currentUser: User;
  permissions: Record<string, AppPermission[]>;
  openedApps: OpenedApp[];
  deploys: Deploy[];
  notifications: Notification[];
};
```

### Deploy List App (`apps/deploy-list-app`)

- Exibe lista mockada de deploys com status
- Permite solicitar novo deploy
- Envia `OPEN_APP_REQUESTED` ao shell para abrir o Deploy Runner App
- Recebe `DEPLOY_STATUS_UPDATED` do shell e atualiza a linha

```ts
type DeployStatus = "pending" | "running" | "done" | "rejected";
```

### Deploy Runner App (`apps/deploy-runner-app`)

- Exibe tela de execução de deploy
- Recebe contexto (usuário, permissões, políticas) do shell via `SET_APP_CONTEXT`
- Habilita ou bloqueia o botão "Iniciar deploy" conforme permissão recebida
- Simula execução de deploy
- Bloqueia deploy se a política de "sexta-feira" estiver ativa
- Envia eventos (`DEPLOY_STARTED`, `DEPLOY_DONE`, `DEPLOY_REJECTED`) ao shell

---

## Permissões

```ts
type AppPermission =
  | "deploy:view"
  | "deploy:write"
  | "deploy:execute";

const permissions = {
  "deploy-list-app": ["deploy:view", "deploy:write"],
  "deploy-runner-app": ["deploy:view", "deploy:execute"]
};
```

O shell valida permissões com:

```ts
can("deploy-runner-app", "deploy:execute"); // boolean
```

Microfrontends nunca decidem sozinhos se podem executar ações sensíveis.

---

## Comunicação (postMessage)

### Filho → Shell

```ts
type MicrofrontendMessageType =
  | "APP_READY"
  | "OPEN_APP_REQUESTED"
  | "PUSH_NOTIFICATION"
  | "DEPLOY_STARTED"
  | "DEPLOY_DONE"
  | "DEPLOY_REJECTED";
```

### Shell → Filho

```ts
type ShellMessageType =
  | "SET_APP_CONTEXT"
  | "DEPLOY_STATUS_UPDATED";
```

### Modelo de comunicação

```
Microfrontend A → Shell → Microfrontend B
```

Microfrontends nunca se comunicam diretamente.

---

## Manifesto de apps

Cada app deve exportar um manifesto:

```ts
export const deployListAppManifest = {
  appId: "deploy-list-app",
  name: "Deploy List",
  description: "Lista e acompanha deploys",
  icon: "📋",
  url: process.env.NEXT_PUBLIC_DEPLOY_LIST_APP_URL,
  requiredPermissions: ["deploy:view"],
  defaultWindowSize: { width: 720, height: 480 }
};
```

O shell usa o manifesto para renderizar, abrir janelas, carregar iframes e validar permissões.

---

## Fluxo principal

### Fluxo feliz

1. Usuário abre o BrowserOS
2. Shell exibe desktop com apps disponíveis
3. Usuário abre o Deploy List App → shell abre janela WinBox com iframe
4. Deploy List App envia `APP_READY`
5. Usuário clica em "Novo deploy"
6. Deploy List App envia `OPEN_APP_REQUESTED`
7. Shell valida permissões e abre o Deploy Runner App
8. Deploy Runner App envia `APP_READY`
9. Shell responde com `SET_APP_CONTEXT` (usuário, permissões, políticas)
10. Botão "Iniciar deploy" fica habilitado
11. Usuário inicia deploy → `DEPLOY_STARTED` → shell exibe notificação
12. Simulação termina → `DEPLOY_DONE`
13. Shell envia `DEPLOY_STATUS_UPDATED` para o Deploy List App
14. Deploy List App atualiza linha como `done`

### Fluxo de erro lúdico (sexta-feira)

1. Usuário ativa modo "simular sexta-feira"
2. Usuário tenta iniciar deploy
3. Deploy Runner App identifica política de bloqueio
4. Envia `DEPLOY_REJECTED` → shell exibe notificação de erro
5. Shell envia `DEPLOY_STATUS_UPDATED` → Deploy List App mostra `rejected`

Mensagem de erro:
> "Deploy na sexta-feira detectado. O BrowserOS bloqueou essa tentativa por motivos de paz coletiva."

---

## Notificações globais

Qualquer microfrontend pode enviar:

```ts
{
  type: "PUSH_NOTIFICATION",
  payload: {
    title: "Deploy iniciado",
    message: "A esteira de deploy foi iniciada.",
    variant: "success" // "success" | "error" | "info"
  }
}
```

O shell exibe um toast global.

---

## Pacote de contratos (`packages/contracts`)

Todos os tipos compartilhados vivem aqui:

- `AppPermission`
- `DeployStatus`
- `ShellMessageType`
- `MicrofrontendMessageType`
- Payloads de cada evento
- Tipo de manifesto de app

Microfrontends importam contratos deste pacote. Nunca duplicar tipos entre apps.

---

## Regras para geração de código com IA

- O projeto é um monorepo Turborepo. Apps ficam em `apps/`, pacotes em `packages/`
- Novos microfrontends devem ter manifesto seguindo o padrão existente
- Novos microfrontends devem importar tipos de `packages/contracts`
- Microfrontends **não podem** acessar diretamente o estado do shell
- Microfrontends **só se comunicam** via `postMessage`
- O shell é responsável por autenticação, permissões e políticas
- Toda ação sensível deve ser validada pelo shell antes de ser executada
- Todo app filho deve enviar `APP_READY` ao montar
- O shell deve responder com `SET_APP_CONTEXT`
- Novas features devem preservar os contratos existentes em `packages/contracts`
- Não usar Module Federation, single-spa, backend real ou banco de dados
- Não adicionar persistência avançada, autenticação real ou segurança avançada de iframe

---

## Requisitos — MVP

### Must Have
- Monorepo Turborepo
- Shell Next.js + TypeScript
- Deploy List App e Deploy Runner App
- WinBox.js para janelas
- iframes para microfrontends
- postMessage para comunicação
- Contratos compartilhados
- Permissões simuladas
- Shell enviando contexto ao filho
- Filho enviando eventos ao shell
- Atualização da lista após deploy
- Erro lúdico de sexta-feira
- Notificações globais

### Should Have
- shadcn/ui para UI
- Histórico de notificações
- Barra de apps abertos
- Botão para alternar permissões em tempo real (demo)
- Modo "simular sexta-feira"
- AI Rules e Skills documentadas

### Won't Have no MVP
- Backend real / banco de dados
- Autenticação real
- Module Federation / single-spa
- SSR complexo
- Comunicação direta entre microfrontends
- Segurança avançada de iframe

---

## Contexto da palestra

A palestra tem ~50 minutos e defende que microfrontends não servem apenas para e-commerce ou times separados por domínio. Eles também são úteis em:

- Sistemas hospitalares, ERPs, CRMs
- Ferramentas de deploy e backoffice
- Aplicações operacionais com múltiplos registros abertos simultaneamente

**Mensagem principal:**
> O shell é o sistema operacional. Os microfrontends são os apps. A IA pode ajudar a criar novos apps, mas quem define as regras é a arquitetura.
