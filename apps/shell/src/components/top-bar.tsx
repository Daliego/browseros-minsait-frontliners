"use client";

import { Bell, Shield, Monitor } from "lucide-react";

interface TopBarProps {
  userName: string;
  environment: string;
  notificationCount: number;
  onNotificationClick: () => void;
  onPermissionsClick: () => void;
}

export function TopBar({
  userName,
  environment,
  notificationCount,
  onNotificationClick,
  onPermissionsClick,
}: TopBarProps) {
  return (
    <header className="h-11 bg-[oklch(0.16_0.01_260)]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 shrink-0 z-50">
      <div className="flex items-center gap-3">
        <Monitor className="w-4 h-4 text-primary" />
        <span className="font-semibold text-white text-sm">BrowserOS</span>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 text-xs text-white/60">
          <span>Usuário:</span>
          <span className="text-white font-medium">{userName}</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-white/60">Ambiente:</span>
          <span className="px-2 py-0.5 bg-accent/20 text-accent rounded-full text-[11px] font-medium">
            {environment}
          </span>
        </div>

        <button
          onClick={onPermissionsClick}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs">Permissões</span>
        </button>

        <button
          onClick={onNotificationClick}
          className="relative flex items-center gap-1 text-white/70 hover:text-white transition-colors"
        >
          <Bell className="w-4 h-4" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
