"use client"

import { useState, useEffect } from "react"
import { MatchMomentum } from "../MatchMomentum"
import { PlayerPositionMap } from "../PlayerPositionMap"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, RotateCcw } from "lucide-react"

export const MatchReplayDashboard = () => {
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const maxTime = 40 * 60 // 40 minutes in seconds

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= maxTime) {
          setIsPlaying(false)
          return prev
        }
        return prev + 10 // Advance by 10 seconds
      })
    }, 100) // Update every 100ms for smooth animation (10x speed)

    return () => clearInterval(interval)
  }, [isPlaying, maxTime])

  const handleReset = () => {
    setCurrentTime(0)
    setIsPlaying(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-[1800px] space-y-8">

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <MatchMomentum currentTime={currentTime} />
          <PlayerPositionMap currentTime={currentTime} />
        </div>

        <div className="mx-auto max-w-3xl space-y-4 rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Match Timeline</div>
            <div className="font-mono text-lg font-semibold">{formatTime(currentTime)}</div>
          </div>

          <Slider
            value={[currentTime]}
            onValueChange={(value) => setCurrentTime(value[0])}
            max={maxTime}
            step={1}
            className="w-full"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">0:00</span>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button size="icon" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
            <span className="text-xs text-muted-foreground">40:00</span>
          </div>
        </div>
      </div>
    </div>
  )
}
