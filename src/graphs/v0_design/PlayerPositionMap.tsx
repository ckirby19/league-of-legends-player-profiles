"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const positionData = [
  { time: 0, x: 15, y: 85 }, // Blue base
  { time: 5, x: 20, y: 75 },
  { time: 10, x: 30, y: 65 },
  { time: 15, x: 40, y: 55 },
  { time: 20, x: 50, y: 50 }, // Mid lane
  { time: 25, x: 60, y: 45 },
  { time: 30, x: 70, y: 35 },
  { time: 35, x: 80, y: 25 },
  { time: 40, x: 85, y: 15 }, // Red base
]

interface PlayerPositionMapProps {
  currentTime: number // in seconds
}

function interpolatePosition(time: number) {
  const minutes = time / 60

  // Find the two position points to interpolate between
  let lowerIndex = 0
  let upperIndex = 0

  for (let i = 0; i < positionData.length - 1; i++) {
    if (minutes >= positionData[i].time && minutes <= positionData[i + 1].time) {
      lowerIndex = i
      upperIndex = i + 1
      break
    }
  }

  if (minutes >= positionData[positionData.length - 1].time) {
    return positionData[positionData.length - 1]
  }

  const lower = positionData[lowerIndex]
  const upper = positionData[upperIndex]
  const ratio = (minutes - lower.time) / (upper.time - lower.time)

  return {
    time: minutes,
    x: lower.x + (upper.x - lower.x) * ratio,
    y: lower.y + (upper.y - lower.y) * ratio,
  }
}

export function PlayerPositionMap({ currentTime }: PlayerPositionMapProps) {
  const currentPosition = interpolatePosition(currentTime)
  const currentMinutes = Math.floor(currentTime / 60)

  // Get all positions up to current time for trail
  const trailPositions = positionData.filter((pos) => pos.time <= currentMinutes)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Player Position Tracking</CardTitle>
        <CardDescription>Movement across Summoner's Rift</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
          {/* League of Legends Map */}
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/minimap-nkaXUdbCiFUckG2hmJMDlH6hQClx6B.png"
            alt="Summoner's Rift Map"
            className="h-full w-full object-cover"
          />

          <div
            className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 shadow-lg ring-4 ring-blue-500/30 transition-all duration-100"
            style={{
              left: `${currentPosition.x}%`,
              top: `${currentPosition.y}%`,
            }}
          >
            <div className="absolute inset-0 animate-ping rounded-full bg-blue-500 opacity-75" />
          </div>

          {/* Trail of previous positions */}
          {trailPositions.map((pos, idx) => (
            <div
              key={idx}
              className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/40"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
              }}
            />
          ))}
        </div>

        {/* Position info */}
        <div className="rounded-lg bg-muted p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">X Position</div>
              <div className="font-mono text-lg font-semibold">{currentPosition.x.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Y Position</div>
              <div className="font-mono text-lg font-semibold">{currentPosition.y.toFixed(1)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
