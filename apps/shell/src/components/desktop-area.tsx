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
      <div className="absolute top-8 left-6 flex flex-col gap-4">
        {apps.map((app) => (
          <AppCard key={app.appId} manifest={app} onOpen={onOpenApp} />
        ))}
      </div>

      {/* Grid texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, oklch(0.9 0 0) 0px, oklch(0.9 0 0) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, oklch(0.9 0 0) 0px, oklch(0.9 0 0) 1px, transparent 1px, transparent 40px)",
        }}
      />

      <div className="absolute inset-0 pointer-events-none">
        <div className="pointer-events-auto h-full">{children}</div>
      </div>
    </div>
  );
}
