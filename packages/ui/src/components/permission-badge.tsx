import * as React from "react";
import type { AppPermission } from "@repo/contracts";
import { Badge } from "./badge";
import { cn } from "../lib/utils";

const permissionColorMap: Record<AppPermission, string> = {
  "deploy:view": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "deploy:write": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "deploy:execute": "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

type PermissionBadgeProps = {
  permission: AppPermission;
  className?: string;
};

export function PermissionBadge({ permission, className }: PermissionBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(permissionColorMap[permission], className)}
    >
      {permission}
    </Badge>
  );
}
