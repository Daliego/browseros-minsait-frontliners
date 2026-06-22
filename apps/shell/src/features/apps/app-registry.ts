import type { AppManifest } from "@repo/contracts";

export const appRegistry: AppManifest[] = [
  {
    appId: "deploy-list-app",
    name: "Deploy List",
    description: "Lista e acompanha deploys",
    icon: "📋",
    url:
      process.env.NEXT_PUBLIC_DEPLOY_LIST_APP_URL ?? "http://localhost:3001",
    requiredPermissions: ["deploy:view"],
    defaultWindowSize: { width: 720, height: 480 },
  },
  {
    appId: "deploy-runner-app",
    name: "Deploy Runner",
    description: "Executa deploys com segurança",
    icon: "🚀",
    url:
      process.env.NEXT_PUBLIC_DEPLOY_RUNNER_APP_URL ?? "http://localhost:3002",
    requiredPermissions: ["deploy:view", "deploy:execute"],
    defaultWindowSize: { width: 640, height: 520 },
  },
  {
    appId: "portifolio-app",
    name: "Portifolio",
    description: "Abre a url do meu portifólio",
    icon: "📚",
    url:
      "https://daliego.github.io/portfolio-case-studies/",
    requiredPermissions: ["deploy:view", "deploy:execute"],
    defaultWindowSize: { width: 640, height: 520 },
  },
  {
    appId: "google",
    name: "Google",
    description: "Abre o Google no navegador",
    icon: "🔍",
    url: "https://www.google.com",
    requiredPermissions: ["*"],
    defaultWindowSize: { width: 800, height: 600 },
  },
  {
    appId: "minecraft",
    name: "Minecraft",
    description: "Abre o site do Minecraft no navegador",
    icon: "⛏️",
    url: "https://www.minecraft.net/pt-br",
    requiredPermissions: ["*"],
    defaultWindowSize: { width: 800, height: 600 },
  },
];
