"use client";

import { useCallback } from "react";
import { Play, Loader2, Rocket } from "lucide-react";
import { ContextCard } from "../src/components/context-card";
import { PipelineSteps } from "../src/components/pipeline-steps";
import { LogArea } from "../src/components/log-area";
import { useShellBridge } from "../src/hooks/use-shell-bridge";
import { useDeployRunner } from "../src/hooks/use-deploy-runner";

export default function DeployRunnerPage() {
  const { shellContext, postToShell } = useShellBridge();

  const canDeploy = shellContext.permissions.includes("deploy:execute");
  const isWaiting = shellContext.user === null;

  const onDeployStarted = useCallback(
    (deployId: string) => {
      postToShell({ type: "DEPLOY_STARTED", payload: { deployId } });
      postToShell({
        type: "PUSH_NOTIFICATION",
        payload: {
          title: "Deploy iniciado",
          message: "A esteira de deploy foi iniciada.",
          variant: "info",
        },
      });
    },
    [postToShell]
  );

  const onDeployDone = useCallback(
    (deployId: string) => {
      postToShell({ type: "DEPLOY_DONE", payload: { deployId } });
      postToShell({
        type: "PUSH_NOTIFICATION",
        payload: {
          title: "Deploy concluído",
          message: "O deploy foi concluído com sucesso!",
          variant: "success",
        },
      });
    },
    [postToShell]
  );

  const onDeployRejected = useCallback(
    (deployId: string, reason: string) => {
      postToShell({ type: "DEPLOY_REJECTED", payload: { deployId, reason } });
      postToShell({
        type: "PUSH_NOTIFICATION",
        payload: {
          title: "Deploy bloqueado",
          message: reason,
          variant: "error",
        },
      });
    },
    [postToShell]
  );

  const { status, steps, logs, isRunning, startDeploy } = useDeployRunner({
    canDeploy,
    policy: shellContext.policy,
    deployId: shellContext.currentDeployId,
    onDeployStarted,
    onDeployDone,
    onDeployRejected,
  });

  const isDone = status === "done" || status === "rejected";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* App header */}
      <div className="border-b border-border bg-card/40 px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <Rocket className="w-4 h-4 text-primary" />
          <div>
            <h1 className="text-sm font-semibold text-foreground leading-none">
              Deploy Runner
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Executa deploys com controle de permissão
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4">
        <ContextCard
          userName={shellContext.user?.name ?? null}
          canDeploy={canDeploy}
          deployId={shellContext.currentDeployId}
          status={status}
        />

        <PipelineSteps steps={steps} />

        <LogArea logs={logs} isRunning={isRunning} />

        <button
          onClick={startDeploy}
          disabled={!canDeploy || isRunning || isWaiting || isDone}
          className="w-full py-2.5 px-4 bg-primary hover:bg-primary/90 disabled:bg-primary/30 disabled:cursor-not-allowed text-primary-foreground rounded-lg flex items-center justify-center gap-2 transition-colors font-medium text-sm"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Executando...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              {isWaiting
                ? "Aguardando contexto do shell..."
                : !canDeploy
                  ? "Sem permissão deploy:execute"
                  : isDone
                    ? status === "done"
                      ? "Deploy concluído ✓"
                      : "Deploy rejeitado ✗"
                    : "Iniciar deploy"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
