"use client";

import { useState } from "react";
import { TopBar } from "../src/components/top-bar";
import { DesktopArea } from "../src/components/desktop-area";
import { Dock } from "../src/components/dock";
import { PermissionsPanel } from "../src/features/permissions/permissions-panel";
import { useShellState } from "../src/features/shell-state/shell-context";
import { appRegistry } from "../src/features/apps/app-registry";

export default function BrowserOSPage() {
  const { state, dispatch } = useShellState();
  const [showPermissions, setShowPermissions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  function openApp(appId: string) {
    const manifest = appRegistry.find((m) => m.appId === appId);
    if (!manifest) return;
    const already = state.openedApps.find((a) => a.appId === appId);
    if (already) return;
    dispatch({
      type: "ADD_OPENED_APP",
      payload: {
        appId: manifest.appId,
        windowId: `${appId}-${Date.now()}`,
        openedAt: Date.now(),
      },
    });
  }

  return (
    <div className="relative h-screen w-screen flex flex-col overflow-hidden">
      <TopBar
        userName={state.currentUser.name}
        environment="staging"
        notificationCount={state.notifications.length}
        onNotificationClick={() => setShowNotifications((v) => !v)}
        onPermissionsClick={() => setShowPermissions((v) => !v)}
      />

      <DesktopArea apps={appRegistry} onOpenApp={openApp} />

      {showPermissions && (
        <PermissionsPanel onClose={() => setShowPermissions(false)} />
      )}

      <Dock
        apps={appRegistry}
        openedApps={state.openedApps}
        onAppClick={openApp}
        onNotificationClick={() => setShowNotifications((v) => !v)}
      />
    </div>
  );
}
