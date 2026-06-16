"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "lucide-react";

type LogAreaProps = {
  logs: string[];
  isRunning: boolean;
};

export function LogArea({ logs, isRunning }: LogAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="flex-1 bg-black/60 rounded-lg border border-border p-3 font-mono text-xs overflow-y-auto min-h-[140px]">
      <div className="flex items-center gap-2 text-muted-foreground mb-2 border-b border-border pb-2">
        <Terminal className="w-3.5 h-3.5" />
        <span>terminal</span>
      </div>
      {logs.length === 0 ? (
        <p className="text-muted-foreground/40">
          Aguardando início do deploy...
        </p>
      ) : (
        logs.map((log, i) => (
          <div key={i} className="text-emerald-400 mb-0.5 leading-relaxed">
            {log}
          </div>
        ))
      )}
      {isRunning && (
        <span className="inline-block w-2 h-3.5 bg-emerald-400 animate-pulse ml-0.5" />
      )}
      <div ref={bottomRef} />
    </div>
  );
}
