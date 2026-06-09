"use client";

import { X, Bell, CheckCircle, AlertCircle, Info, Trash2 } from "lucide-react";
import { useNotifications } from "./use-notifications";
import type { Notification } from "../shell-state/types";

function NotificationIcon({ variant }: { variant: Notification["variant"] }) {
  switch (variant) {
    case "success":
      return <CheckCircle className="w-4 h-4 text-accent" />;
    case "error":
      return <AlertCircle className="w-4 h-4 text-destructive" />;
    default:
      return <Info className="w-4 h-4 text-primary" />;
  }
}

function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60_000) return "agora";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}min atrás`;
  return `${Math.floor(diff / 3_600_000)}h atrás`;
}

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const { notifications, dismissNotification, clearAll } = useNotifications();

  if (!isOpen) return null;

  return (
    <div className="absolute top-12 right-4 w-80 bg-[oklch(0.18_0.01_260)]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <span className="font-medium text-white text-sm">Notificações</span>
          {notifications.length > 0 && (
            <span className="text-xs text-white/40">
              ({notifications.length})
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"
              title="Limpar todas"
            >
              <Trash2 className="w-3.5 h-3.5 text-white/40 hover:text-white/70" />
            </button>
          )}
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-white/50 text-sm">
            Nenhuma notificação
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <NotificationIcon variant={n.variant} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm text-white truncate">
                      {n.title}
                    </span>
                    <button
                      onClick={() => dismissNotification(n.id)}
                      className="shrink-0 text-white/40 hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-white/60 mt-0.5">{n.message}</p>
                  <span className="text-[10px] text-white/40 mt-1 block">
                    {formatTime(n.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
