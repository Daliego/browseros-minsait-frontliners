"use client";

import { Bell } from "lucide-react";
import type { AppManifest } from "@repo/contracts";
import type { OpenedApp } from "@repo/contracts";

interface DockProps {
  apps: AppManifest[];
  openedApps: OpenedApp[];
  onAppClick: (appId: string) => void;
  onNotificationClick: () => void;
}

export function Dock({
  apps,
  openedApps,
  onAppClick,
  onNotificationClick,
}: DockProps) {
  const openCount = openedApps.length;
  const openIds = new Set(openedApps.map((a) => a.appId));

  return (
    <footer className="h-14 bg-[oklch(0.16_0.01_260)]/90 backdrop-blur-xl border-t border-white/10 flex items-center justify-between px-4 shrink-0 z-50">
      <div className="flex items-center gap-2">
        {apps.map((app) => {
          const isOpen = openIds.has(app.appId);
          return (
            <button
              key={app.appId}
              onClick={() => onAppClick(app.appId)}
              className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 text-xl ${
                isOpen
                  ? "bg-primary/25 ring-1 ring-primary/40"
                  : "bg-white/5 hover:bg-white/10"
              }`}
              title={app.name}
            >
              {app.icon}
              {isOpen && (
                <span className="absolute -bottom-0.5 w-1 h-1 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs text-white/70">
          Apps abertos:{" "}
          <span className="text-white font-medium">{openCount}</span>
        </span>

        <button
          onClick={onNotificationClick}
          className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          title="Central de Notificações"
        >
          <Bell className="w-4 h-4 text-white/80" />
        </button>
      </div>
    </footer>
  );
}
