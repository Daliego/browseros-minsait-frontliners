"use client"

import { Shield, Check } from "lucide-react"

interface Permission {
  id: string
  name: string
  active: boolean
}

interface PermissionsPanelProps {
  permissions: Permission[]
}

export function PermissionsPanel({ permissions }: PermissionsPanelProps) {
  return (
    <div className="absolute top-16 right-4 w-56 bg-[oklch(0.18_0.01_260)]/90 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-white">Permissões atuais</span>
      </div>
      
      <div className="space-y-2">
        {permissions.map((permission) => (
          <div
            key={permission.id}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-white/60 font-mono text-xs">
              {permission.name}
            </span>
            <span
              className={`flex items-center gap-1 text-xs font-medium ${
                permission.active ? "text-accent" : "text-white/40"
              }`}
            >
              {permission.active && <Check className="w-3 h-3" />}
              {permission.active ? "ativo" : "inativo"}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export const defaultPermissions: Permission[] = [
  { id: "deploy:view", name: "deploy:view", active: true },
  { id: "deploy:write", name: "deploy:write", active: true },
  { id: "deploy:execute", name: "deploy:execute", active: true },
]
