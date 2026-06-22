# Contexto para Geração de Slides — Microfrontends em Contextos Não Convencionais

> **Instruções para a IA geradora de slides:**
> - Mínimo de texto por slide: títulos curtos + bullets de 2-5 palavras
> - Prefira ícones, diagramas e visuals ao invés de parágrafos
> - Tema escuro sugerido (dark background, tons de roxo/azul/verde)
> - Fonte de apresentação (~50 min), tom técnico mas acessível
> - Linguagem: Português brasileiro
> - Onde indicado `[IMAGEM]`, reservar espaço visual para screenshot ou diagrama

---

## SLIDE 1 — Capa

**Título:** Microfrontends em Contextos Não Convencionais
**Subtítulo:** O shell é o sistema operacional. Os microfrontends são os apps.
**Visual:** Logo/ícone de janelas empilhadas dentro de um navegador

---

## SLIDE 2 — O que são Microfrontends?

**Título:** O que são Microfrontends?

**Bullets:**
- Divisão do frontend em partes independentes
- Cada parte: equipe, deploy e ciclo de vida próprios
- Integrados em tempo de execução (runtime)
- Análogos a microsserviços — mas no frontend

**Visual:** Diagrama simples: um container grande dividido em blocos menores

---

## SLIDE 3 — Problemas que Resolvem

**Título:** Por que usar?

**Bullets:**
- Times grandes → conflitos de merge, acoplamento
- Deploys acoplados → risco alto de regressão
- Stacks diferentes em partes distintas do sistema
- Escalar equipes sem escalar complexidade

**Visual:** Duas colunas — "Antes" (monólito confuso) vs "Depois" (blocos isolados)

---

## SLIDE 4 — Exemplos Reais

**Título:** Você já viu isso

**Bullets:**
- Amazon: cada seção da página = time independente
- Spotify: player, busca, biblioteca — times separados
- Mercado Livre: checkout isolado do catálogo

**Visual:** `[IMAGEM]` — Screenshots de produtos reais mostrando áreas distintas  
*(Sugestão: Amazon com regiões destacadas / Spotify com player e catálogo separados)*

---

## SLIDE 5 — BrowserOS: A Ideia

**Título:** E se o navegador fosse um sistema operacional?

**Bullets:**
- Shell central = "núcleo do OS"
- Apps abertos como janelas no desktop
- Cada app: uma aplicação Next.js independente
- Um protótipo — não produção

**Visual:** `[IMAGEM]` — Screenshot do BrowserOS com janelas abertas no desktop

---

## SLIDE 6 — Como o BrowserOS Funciona

**Título:** Arquitetura em alto nível

**Visual:** Diagrama:
```
┌─────────────────────────────────────┐
│              SHELL (Next.js)        │
│  ┌──────────┐    ┌───────────────┐  │
│  │  iframe  │    │    iframe     │  │
│  │ App A    │    │    App B      │  │
│  └──────────┘    └───────────────┘  │
│       WinBox.js (janelas flutuantes) │
└─────────────────────────────────────┘
```

**Bullets:**
- iframes simulam janelas isoladas do OS
- WinBox.js: drag, resize, minimize nativos
- Shell controla tudo: estado, permissões, eventos

---

## SLIDE 7 — Vantagens vs Abordagem Tradicional

**Título:** Por que iframes aqui?

| Tradicional | BrowserOS |
|---|---|
| Componentes acoplados | Apps completamente isolados |
| Estado global compartilhado | Estado próprio por app |
| Deploy conjunto | Deploy independente |
| Bug em um afeta todos | Falha isolada no iframe |

**Visual:** Tabela comparativa acima ou dois cards lado a lado

---

## SLIDE 8 — Autenticação Centralizada

**Título:** O shell como guardião

**Bullets:**
- Somente o shell acessa o serviço de autenticação
- Repassa para cada app: `{ user, permissions, policies }`
- Microfrontend nunca decide sozinho o que pode fazer
- Permissões granulares por app

**Visual:** Diagrama de fluxo:
```
Auth Service → Shell → SET_APP_CONTEXT → Microfrontend
```

**Exemplo real no código:**
```
deploy:view | deploy:write | deploy:execute
```

---

## SLIDE 9 — Onde um Shell é Útil?

**Título:** Além do e-commerce

**Bullets:**
- Sistemas hospitalares (prontuário + exames + triagem)
- ERPs e CRMs (clientes + pedidos + financeiro)
- Ferramentas de DevOps (pipelines + logs + deploys)
- Backoffice operacional com múltiplos contextos abertos

**Visual:** Grid de ícones representando cada domínio

---

## SLIDE 10 — Construído com IA

**Título:** Prototipado com Claude + Turborepo

**Bullets:**
- Protótipo semi-funcional construído com IA (Claude)
- **Turborepo:** gerenciador de monorepo — builds incrementais, tasks em paralelo
- **Claude Skills:** instruções estruturadas para a IA executar tarefas específicas
- **Claude Rules:** regras obrigatórias que a IA sempre segue no projeto
- **Workflows:** sequências de ações que a IA executa de forma autônoma

**Destaque:**
> Criei uma Skill que orquestra a IA para adicionar novos microfrontends corretamente — com manifesto, permissões, contratos e integração ao shell.

**Visual:** `[IMAGEM]` — Screenshot do arquivo `create-microfrontend.md` ou do Claude executando a skill

---

## SLIDE 11 — Monorepo: Por que?

**Título:** Uma única base de código

**Estrutura:**
```
apps/
  shell/              ← o "OS"
  deploy-list-app/    ← microfrontend
  deploy-runner-app/  ← microfrontend

packages/
  contracts/          ← tipos compartilhados
  ui/                 ← componentes shared
  config/             ← ESLint, TS, Tailwind
```

**Bullets:**
- Tipos e contratos compartilhados sem duplicação
- IA tem contexto completo de toda a aplicação
- Facilita a demonstração ao vivo
- `packages/contracts` = fonte de verdade dos eventos

---

## SLIDE 12 — Comunicação: postMessage

**Título:** Como os apps se falam

**Regra fundamental:**
> Microfrontend A não fala com Microfrontend B. Tudo passa pelo Shell.

**Diagrama:**
```
App A ──→ Shell ──→ App B
```

**Mensagens filho → shell:**
- `APP_READY` · `OPEN_APP_REQUESTED` · `PUSH_NOTIFICATION`
- `DEPLOY_STARTED` · `DEPLOY_DONE` · `DEPLOY_REJECTED`

**Mensagens shell → filho:**
- `SET_APP_CONTEXT` · `DEPLOY_STATUS_UPDATED`

**Visual:** Diagrama de setas entre os três blocos

---

## SLIDE 13 — Isolamento e Segurança

**Título:** Cada app é uma ilha

**Bullets:**
- Cada iframe tem seu próprio `localStorage` e `cookies`
- Compartilhamento só via `postMessage` (opt-in explícito)
- Shell valida `event.origin` — apenas origens permitidas
- Contratos tipados definem quais mensagens são válidas

**Código real (simplificado):**
```ts
if (!ALLOWED_ORIGINS.has(event.origin)) return;
if (!isMicrofrontendMessage(event.data)) return;
```

**Visual:** Diagrama mostrando o iframe como uma "caixa selada" com uma porta controlada

---

## SLIDE 14 — Demo ao Vivo

**Título:** Vamos ver funcionando

**Checklist visual (sem abrir no slide):**
*(Roteiro para o apresentador — não exibir no slide)*

1. Abrir estrutura do monorepo no Antigravity
2. Mostrar como a Skill do Claude adiciona um novo app
3. Abrir portfólio dentro do BrowserOS
4. Demonstrar Deploy List App → Deploy Runner App
5. Mostrar fluxo de permissões em tempo real
6. Ativar modo "simular sexta-feira" → erro lúdico

**Slide visual:** Fundo com screenshot do desktop do BrowserOS + texto: *"Ao vivo →"*

---

## SLIDE 15 — Conclusão

**Título:** O que levar daqui

**Bullets:**
- Microfrontends funcionam além do e-commerce
- O shell é uma abstração poderosa para controle centralizado
- iframes + postMessage: simples, isolado, eficaz
- IA + arquitetura bem definida = velocidade de entrega real

**Mensagem final:**
> A IA pode criar os apps. A arquitetura define as regras.

**Visual:** Diagrama final mostrando o BrowserOS completo com shell no centro e apps ao redor

---

## Notas para o Apresentador

*(Não exibir como slide)*

- Slides 10–13: enfatizar que o monorepo não é obrigatório em produção — foi uma escolha para facilitar demo e contexto da IA
- Slide 8: mencionar que em produção real usaria JWT, OAuth, etc. Aqui é simulação
- Slide 6: WinBox.js é open source, ~15KB, sem dependências
- Demo: ter todos os apps rodando antes (`pnpm dev`)
- Slide 14: se o tempo apertar, pular portfólio e focar no fluxo de deploy
