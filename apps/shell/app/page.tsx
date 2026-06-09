"use client";

import { useState } from "react";
import { TopBar } from "../src/components/top-bar";
import { DesktopArea } from "../src/components/desktop-area";
import { Dock } from "../src/components/dock";
import type { AppManifest, OpenedApp } from "@repo/contracts";

const REGISTRY: AppManifest[] = [
  {
    appId: "deploy-list-app",
    name: "Deploy List",
    description: "Lista e acompanha deploys",
    icon: "📋",
    url: process.env.NEXT_PUBLIC_DEPLOY_LIST_APP_URL ?? "http://localhost:3001",
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

export default function BrowserOSPage() {
  const [openedApps, setOpenedApps] = useState<OpenedApp[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  function openApp(appId: string) {
    const already = openedApps.find((a) => a.appId === appId);
    if (already) return;
    setOpenedApps((prev) => [
      ...prev,
      {
        appId: appId as OpenedApp["appId"],
        windowId: `${appId}-${Date.now()}`,
        openedAt: Date.now(),
      },
    ]);
  }

  return (
    <div className="relative h-screen w-screen flex flex-col overflow-hidden">
      <TopBar
        userName="Lucas"
        environment="staging"
        notificationCount={0}
        onNotificationClick={() => setShowNotifications((v) => !v)}
        onPermissionsClick={() => {}}
      />

      <DesktopArea apps={REGISTRY} onOpenApp={openApp} />

      <Dock
        apps={REGISTRY}
        openedApps={openedApps}
        onAppClick={openApp}
        onNotificationClick={() => setShowNotifications((v) => !v)}
      />
    </div>
  );
}
