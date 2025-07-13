"use client"

import { useState, useEffect } from "react"
import { Monitor } from "lucide-react"

interface PerformanceMetrics {
  fps: number
  memory: number
  loadTime: number
}

export function PerformanceMonitor() {
  const [isVisible, setIsVisible] = useState(false)
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memory: 0,
    loadTime: 0,
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "P") {
        setIsVisible(!isVisible)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    const updateMetrics = () => {
      const now = performance.now()
      const memory = (performance as any).memory?.usedJSHeapSize || 0

      setMetrics({
        fps: Math.round(1000 / (now - (window as any).lastFrameTime || now)),
        memory: Math.round(memory / 1024 / 1024),
        loadTime: Math.round(performance.timing?.loadEventEnd - performance.timing?.navigationStart || 0),
      })
      ;(window as any).lastFrameTime = now
    }

    const interval = setInterval(updateMetrics, 1000)
    return () => clearInterval(interval)
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs font-mono">
      <div className="flex items-center gap-2 mb-2">
        <Monitor className="h-3 w-3" />
        <span>Performance</span>
      </div>
      <div className="space-y-1">
        <div>FPS: {metrics.fps}</div>
        <div>Memory: {metrics.memory}MB</div>
        <div>Load: {metrics.loadTime}ms</div>
      </div>
      <div className="text-xs opacity-60 mt-2">Ctrl+Shift+P to toggle</div>
    </div>
  )
}
