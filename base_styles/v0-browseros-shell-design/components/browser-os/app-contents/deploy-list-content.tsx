"use client"

import { Play, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react"

interface Deploy {
  id: string
  name: string
  environment: string
  status: "success" | "failed" | "running" | "pending"
  time: string
}

const mockDeploys: Deploy[] = [
  { id: "1", name: "api-gateway", environment: "production", status: "success", time: "2 min atrás" },
  { id: "2", name: "frontend-app", environment: "staging", status: "running", time: "agora" },
  { id: "3", name: "auth-service", environment: "production", status: "failed", time: "15 min atrás" },
  { id: "4", name: "payment-service", environment: "staging", status: "pending", time: "1h atrás" },
  { id: "5", name: "notification-svc", environment: "production", status: "success", time: "2h atrás" },
]

const getStatusIcon = (status: Deploy["status"]) => {
  switch (status) {
    case "success":
      return <CheckCircle className="w-4 h-4 text-green-500" />
    case "failed":
      return <XCircle className="w-4 h-4 text-red-500" />
    case "running":
      return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
    case "pending":
      return <Clock className="w-4 h-4 text-yellow-500" />
  }
}

const getStatusLabel = (status: Deploy["status"]) => {
  switch (status) {
    case "success":
      return "Sucesso"
    case "failed":
      return "Falhou"
    case "running":
      return "Rodando"
    case "pending":
      return "Pendente"
  }
}

interface DeployListContentProps {
  onRunDeploy?: (deployId: string) => void
}

export function DeployListContent({ onRunDeploy }: DeployListContentProps) {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Lista de Deploys</h3>
        <span className="text-xs text-muted-foreground">{mockDeploys.length} deploys</span>
      </div>
      
      <div className="space-y-2">
        {mockDeploys.map((deploy) => (
          <div
            key={deploy.id}
            className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(deploy.status)}
              <div>
                <p className="text-sm font-medium text-foreground">{deploy.name}</p>
                <p className="text-xs text-muted-foreground">
                  {deploy.environment} • {deploy.time}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {getStatusLabel(deploy.status)}
              </span>
              <button
                onClick={() => onRunDeploy?.(deploy.id)}
                className="w-8 h-8 flex items-center justify-center rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
                title="Executar deploy"
              >
                <Play className="w-4 h-4 text-primary" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
