"use client"

import { useState } from "react"
import { Play, Terminal, CheckCircle, Loader2 } from "lucide-react"

type RunnerStatus = "idle" | "running" | "completed"

export function DeployRunnerContent() {
  const [status, setStatus] = useState<RunnerStatus>("idle")
  const [logs, setLogs] = useState<string[]>([])

  const runDeploy = () => {
    setStatus("running")
    setLogs([])

    const mockLogs = [
      "🚀 Iniciando deploy...",
      "📦 Instalando dependências...",
      "⚙️ Executando build...",
      "🔄 Criando container...",
      "📡 Conectando ao servidor...",
      "✅ Deploy concluído com sucesso!",
    ]

    mockLogs.forEach((log, index) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, log])
        if (index === mockLogs.length - 1) {
          setStatus("completed")
        }
      }, (index + 1) * 800)
    })
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Deploy Runner</h3>
        <div className="flex items-center gap-2">
          {status === "running" && (
            <span className="flex items-center gap-1 text-xs text-blue-500">
              <Loader2 className="w-3 h-3 animate-spin" />
              Executando
            </span>
          )}
          {status === "completed" && (
            <span className="flex items-center gap-1 text-xs text-green-500">
              <CheckCircle className="w-3 h-3" />
              Concluído
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 bg-black/50 rounded-lg p-3 font-mono text-xs overflow-y-auto mb-4 min-h-[200px]">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Terminal className="w-4 h-4" />
          <span>Terminal</span>
        </div>
        {logs.length === 0 && status === "idle" && (
          <p className="text-muted-foreground/50">
            Clique em "Executar" para iniciar o deploy...
          </p>
        )}
        {logs.map((log, index) => (
          <div key={index} className="text-green-400 mb-1">
            {log}
          </div>
        ))}
        {status === "running" && (
          <span className="inline-block w-2 h-4 bg-green-400 animate-pulse" />
        )}
      </div>

      <button
        onClick={runDeploy}
        disabled={status === "running"}
        className="w-full py-2 px-4 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground rounded-lg flex items-center justify-center gap-2 transition-colors font-medium text-sm"
      >
        <Play className="w-4 h-4" />
        {status === "running" ? "Executando..." : "Executar Deploy"}
      </button>
    </div>
  )
}
