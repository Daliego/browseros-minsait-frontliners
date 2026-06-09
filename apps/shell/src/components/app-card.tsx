"use client";

import type { AppManifest } from "@repo/contracts";

interface AppCardProps {
  manifest: AppManifest;
  onOpen: (appId: string) => void;
}

export function AppCard({ manifest, onOpen }: AppCardProps) {
  return (
    <button
      onDoubleClick={() => onOpen(manifest.appId)}
      onClick={() => onOpen(manifest.appId)}
      className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer w-20"
      title={`Abrir ${manifest.name}`}
    >
      <div className="w-14 h-14 bg-card/70 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-all text-3xl">
        {manifest.icon}
      </div>
      <span className="text-xs text-white text-center font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] leading-tight">
        {manifest.name}
      </span>
    </button>
  );
}
