"use client"

import { ClipboardList, Rocket } from "lucide-react"

interface AppIcon {
  id: string
  name: string
  icon: React.ReactNode
}

interface DesktopAreaProps {
  apps: AppIcon[]
  onAppDoubleClick: (appId: string) => void
  children?: React.ReactNode
}

export function DesktopArea({ apps, onAppDoubleClick, children }: DesktopAreaProps) {
  return (
    <div
      className="flex-1 relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url(/wallpaper.png)" }}
    >
      {/* Desktop Icons */}
      <div className="absolute top-6 left-6 flex flex-col gap-5">
        {apps.map((app) => (
          <button
            key={app.id}
            onDoubleClick={() => onAppDoubleClick(app.id)}
            className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer w-20"
          >
            <div className="w-14 h-14 bg-card/70 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-all">
              {app.icon}
            </div>
            <span className="text-xs text-white text-center font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              {app.name}
            </span>
          </button>
        ))}
      </div>
      
      {/* Windows Container */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="pointer-events-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

export const defaultApps: AppIcon[] = [
  {
    id: "deploy-list",
    name: "Deploy List",
    icon: <ClipboardList className="w-8 h-8 text-primary" />,
  },
  {
    id: "deploy-runner",
    name: "Deploy Runner",
    icon: <Rocket className="w-8 h-8 text-accent" />,
  },
]
