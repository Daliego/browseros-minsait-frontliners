import * as React from "react";
import type { DeployStatus } from "@repo/contracts";
import { Badge } from "./badge";
import { cn } from "../lib/utils";

const statusVariantMap: Record<DeployStatus, string> = {
  done: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  rejected: "bg-destructive/20 text-red-400 border-destructive/30",
  running: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  pending: "bg-secondary text-secondary-foreground border-transparent",
};

const statusLabelMap: Record<DeployStatus, string> = {
  done: "Done",
  rejected: "Rejected",
  running: "Running",
  pending: "Pending",
};

type StatusBadgeProps = {
  status: DeployStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(statusVariantMap[status], className)}
    >
      {statusLabelMap[status]}
    </Badge>
  );
}
