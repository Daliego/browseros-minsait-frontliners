"use client";

import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import type { PipelineStep } from "../types";

type PipelineStepsProps = {
  steps: PipelineStep[];
};

function StepIcon({ status }: { status: PipelineStep["status"] }) {
  switch (status) {
    case "done":
      return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
    case "active":
      return <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />;
    case "error":
      return <XCircle className="w-5 h-5 text-destructive shrink-0" />;
    default:
      return <Circle className="w-5 h-5 text-muted-foreground/40 shrink-0" />;
  }
}

export function PipelineSteps({ steps }: PipelineStepsProps) {
  return (
    <div className="space-y-2">
      {steps.map((step, idx) => (
        <div
          key={step.id}
          className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
            step.status === "active"
              ? "bg-primary/10 border border-primary/20"
              : step.status === "done"
                ? "bg-emerald-500/10 border border-emerald-500/20"
                : step.status === "error"
                  ? "bg-destructive/10 border border-destructive/20"
                  : "bg-secondary/30 border border-transparent"
          }`}
        >
          <StepIcon status={step.status} />
          <span
            className={`text-sm font-medium ${
              step.status === "active"
                ? "text-foreground"
                : step.status === "done"
                  ? "text-emerald-400"
                  : step.status === "error"
                    ? "text-destructive"
                    : "text-muted-foreground"
            }`}
          >
            {idx + 1}. {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}
