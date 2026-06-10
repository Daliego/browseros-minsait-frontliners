"use client"

import { useState, useCallback } from "react"
import { ClipboardList, Rocket } from "lucide-react"
import { TopBar } from "@/components/browser-os/top-bar"
import { DesktopArea, defaultApps } from "@/components/browser-os/desktop-area"
import { Dock } from "@/components/browser-os/dock"
import { AppWindow } from "@/components/browser-os/app-window"
import { PermissionsPanel, defaultPermissions } from "@/components/browser-os/permissions-panel"
import { NotificationsPanel, defaultNotifications } from "@/components/browser-os/notifications-panel"
import { DeployListContent } from "@/components/browser-os/app-contents/deploy-list-content"
import { DeployRunnerContent } from "@/components/browser-os/app-contents/deploy-runner-content"

interface OpenWindow {
  id: string
  appId: string
  title: string
  icon: React.ReactNode
  position: { x: number; y: number }
}

export default function BrowserOS() {
  const [openWindows, setOpenWindows] = useState<OpenWindow[]>([])
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState(defaultNotifications)

  const openApp = useCallback((appId: string) => {
    // Check if app is already open
    const existingWindow = openWindows.find((w) => w.appId === appId)
    if (existingWindow) {
      setActiveWindowId(existingWindow.id)
      return
    }

    const appConfig = {
      "deploy-list": {
        title: "Deploy List",
        icon: <ClipboardList className="w-4 h-4 text-primary" />,
      },
      "deploy-runner": {
        title: "Deploy Runner",
        icon: <Rocket className="w-4 h-4 text-accent" />,
      },
    }[appId]

    if (!appConfig) return

    const windowId = `${appId}-${Date.now()}`
    const offset = openWindows.length * 30

    setOpenWindows((prev) => [
      ...prev,
      {
        id: windowId,
        appId,
        title: appConfig.title,
        icon: appConfig.icon,
        position: { x: 150 + offset, y: 80 + offset },
      },
    ])
    setActiveWindowId(windowId)
  }, [openWindows])

  const closeWindow = useCallback((windowId: string) => {
    setOpenWindows((prev) => prev.filter((w) => w.id !== windowId))
    if (activeWindowId === windowId) {
      setActiveWindowId(null)
    }
  }, [activeWindowId])

  const focusWindow = useCallback((windowId: string) => {
    setActiveWindowId(windowId)
  }, [])

  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }, [])

  const handleRunDeploy = useCallback((deployId: string) => {
    openApp("deploy-runner")
  }, [openApp])

  const dockApps = [
    {
      id: "deploy-list",
      name: "Deploy List",
      icon: <ClipboardList className="w-6 h-6 text-primary" />,
      isOpen: openWindows.some((w) => w.appId === "deploy-list"),
    },
    {
      id: "deploy-runner",
      name: "Deploy Runner",
      icon: <Rocket className="w-6 h-6 text-accent" />,
      isOpen: openWindows.some((w) => w.appId === "deploy-runner"),
    },
  ]

  const renderWindowContent = (appId: string) => {
    switch (appId) {
      case "deploy-list":
        return <DeployListContent onRunDeploy={handleRunDeploy} />
      case "deploy-runner":
        return <DeployRunnerContent />
      default:
        return <div className="p-4 text-muted-foreground">Conteúdo do app</div>
    }
  }

  return (
    <div className="relative h-screen w-screen flex flex-col overflow-hidden">
      <TopBar
        user="Lucas"
        environment="staging"
        notificationCount={notifications.length}
        onNotificationClick={() => setShowNotifications(!showNotifications)}
      />

      <DesktopArea apps={defaultApps} onAppDoubleClick={openApp}>
        {openWindows.map((window) => (
          <AppWindow
            key={window.id}
            id={window.id}
            title={window.title}
            icon={window.icon}
            isActive={activeWindowId === window.id}
            initialPosition={window.position}
            onClose={() => closeWindow(window.id)}
            onFocus={() => focusWindow(window.id)}
          >
            {renderWindowContent(window.appId)}
          </AppWindow>
        ))}
      </DesktopArea>

      <PermissionsPanel permissions={defaultPermissions} />

      <NotificationsPanel
        isOpen={showNotifications}
        notifications={notifications}
        onClose={() => setShowNotifications(false)}
        onDismiss={dismissNotification}
      />

      <Dock
        apps={dockApps}
        onAppClick={openApp}
        onNotificationClick={() => setShowNotifications(!showNotifications)}
      />
    </div>
  )
}
