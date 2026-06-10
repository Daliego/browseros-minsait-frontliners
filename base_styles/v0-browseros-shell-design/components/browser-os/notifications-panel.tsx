"use client"

import { X, Bell, CheckCircle, AlertCircle, Info } from "lucide-react"

interface Notification {
  id: string
  type: "success" | "error" | "info"
  title: string
  message: string
  time: string
}

interface NotificationsPanelProps {
  isOpen: boolean
  notifications: Notification[]
  onClose: () => void
  onDismiss: (id: string) => void
}

export function NotificationsPanel({
  isOpen,
  notifications,
  onClose,
  onDismiss,
}: NotificationsPanelProps) {
  if (!isOpen) return null

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-accent" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-destructive" />
      case "info":
        return <Info className="w-4 h-4 text-primary" />
    }
  }

  return (
    <div className="absolute top-12 right-4 w-80 bg-[oklch(0.18_0.01_260)]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <span className="font-medium text-white">Notificações</span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-white/50 text-sm">
            Nenhuma notificação
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm text-white truncate">
                      {notification.title}
                    </span>
                    <button
                      onClick={() => onDismiss(notification.id)}
                      className="shrink-0 text-white/50 hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-white/60 mt-0.5">
                    {notification.message}
                  </p>
                  <span className="text-[10px] text-white/40 mt-1 block">
                    {notification.time}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export const defaultNotifications: Notification[] = [
  {
    id: "1",
    type: "success",
    title: "Deploy concluído",
    message: "O deploy do projeto foi realizado com sucesso.",
    time: "2 min atrás",
  },
  {
    id: "2",
    type: "info",
    title: "Nova versão disponível",
    message: "Versão 2.1.0 está disponível para atualização.",
    time: "15 min atrás",
  },
  {
    id: "3",
    type: "error",
    title: "Erro no build",
    message: "O build do ambiente staging falhou.",
    time: "1h atrás",
  },
]
