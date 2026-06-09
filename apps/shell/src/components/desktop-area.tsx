"use client";

import type { AppManifest } from "@repo/contracts";
import { AppCard } from "./app-card";

interface DesktopAreaProps {
  apps: AppManifest[];
  onOpenApp: (appId: string) => void;
  children?: React.ReactNode;
}

export function DesktopArea({ apps, onOpenApp, children }: DesktopAreaProps) {
  return (
    <div
      className="flex-1 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 20% 50%, oklch(0.2 0.06 250) 0%, oklch(0.12 0.02 260) 60%, oklch(0.08 0.01 260) 100%)",
      }}
    >
      <div className="absolute top-6 left-6 flex flex-col gap-5">
        {apps.map((app) => (
          <AppCard key={app.appId} manifest={app} onOpen={onOpenApp} />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="pointer-events-auto h-full">{children}</div>
      </div>
    </div>
  );
}
