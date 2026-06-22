# Comunicação entre iframes ao iniciar um deploy

Os iframes **nunca se falam diretamente**. Tudo passa pelo shell.

```
deploy-list-app (iframe)  →  shell  →  deploy-runner-app (iframe)
```

---

## Passo a passo

**1. Usuário clica em ▶ no deploy-list-app**

`use-shell-bridge.ts` envia para o shell:
```js
window.parent.postMessage({
  type: "OPEN_APP_REQUESTED",
  payload: { appId: "deploy-runner-app", params: { deployId: "d-002" } }
}, "*")
```

**2. Shell recebe, valida e salva o deployId**

`on-open-app-requested.ts` verifica permissão (`deploy:view`), então:
```js
dispatch({ type: "SET_PENDING_DEPLOY_ID", payload: { deployId: "d-002" } })
openApp("deploy-runner-app") // abre a janela WinBox com o iframe
```

**3. deploy-runner-app monta e avisa o shell**

`use-shell-bridge.ts` do runner envia:
```js
window.parent.postMessage({
  type: "APP_READY",
  payload: { appId: "deploy-runner-app" }
}, "*")
```

**4. Shell responde com o contexto (incluindo o deployId)**

`on-app-ready.ts` pega o `pendingDeployId` do estado e manda pro runner:
```js
iframe.contentWindow.postMessage({
  type: "SET_APP_CONTEXT",
  payload: { user, permissions, policy, currentDeployId: "d-002" }
}, origin)
```

---

## Por que funciona assim

O `deployId` não viaja direto de um iframe para o outro.  
Ele **passa pelo estado do shell** como `pendingDeployId`, fica guardado no reducer até o runner enviar `APP_READY`, e só então é entregue via `SET_APP_CONTEXT`.  
Depois disso o shell limpa o `pendingDeployId` para não vazar para o próximo app que abrir.
