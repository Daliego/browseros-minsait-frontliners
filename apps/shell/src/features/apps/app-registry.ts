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
];
