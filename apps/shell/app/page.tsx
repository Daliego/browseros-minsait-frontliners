"use client";

import { useState } from "react";
import { TopBar } from "../src/components/top-bar";
import { DesktopArea } from "../src/components/desktop-area";
import { Dock } from "../src/components/dock";
import { PermissionsPanel } from "../src/features/permissions/permissions-panel";
import { useShellState } from "../src/features/shell-state/shell-context";
import { useWindowManager } from "../src/features/window-manager/use-window-manager";
import { appRegistry } from "../src/features/apps/app-registry";

export default function BrowserOSPage() {
  const { state } = useShellState();
  const { openApp } = useWindowManager();
  const [showPermissions, setShowPermissions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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
