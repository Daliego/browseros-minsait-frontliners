"use client"

import { useState, useRef, useEffect } from "react"
import { X, Minus, Square } from "lucide-react"

interface AppWindowProps {
  id: string
  title: string
  icon: React.ReactNode
  isActive: boolean
  initialPosition?: { x: number; y: number }
  onClose: () => void
  onFocus: () => void
  children?: React.ReactNode
}

export function AppWindow({
  id,
  title,
  icon,
  isActive,
  initialPosition = { x: 100, y: 50 },
  onClose,
  onFocus,
  children,
}: AppWindowProps) {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const windowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragOffset])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
      onFocus()
    }
  }

  return (
    <div
      ref={windowRef}
      className={`absolute rounded-xl overflow-hidden shadow-2xl transition-shadow ${
        isActive
          ? "ring-1 ring-white/15 shadow-black/50 z-50"
          : "ring-1 ring-white/5 shadow-black/40 z-40"
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: 600,
        minHeight: 400,
      }}
      onMouseDown={onFocus}
    >
      {/* Title Bar */}
      <div
        className={`h-10 flex items-center justify-between px-3 cursor-move select-none bg-[oklch(0.18_0.01_260)]/95 backdrop-blur-xl border-b border-white/5`}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center">
            {icon}
          </div>
          <span className="text-sm font-medium text-white">{title}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <Minus className="w-4 h-4 text-white/60" />
          </button>
          <button
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <Square className="w-3 h-3 text-white/60" />
          </button>
          <button
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-destructive/30 transition-colors group"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
          >
            <X className="w-4 h-4 text-white/60 group-hover:text-destructive-foreground" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="bg-[oklch(0.2_0.01_260)]/95 backdrop-blur-xl min-h-[360px]">
        {children}
      </div>
    </div>
  )
}
