"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Area } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const momentumData = [
  { time: 0, goldDiff: 0, blueKills: 0, redKills: 0 },
  { time: 5, goldDiff: 1200, blueKills: 3, redKills: 1 },
  { time: 10, goldDiff: 800, blueKills: 5, redKills: 4 },
  { time: 15, goldDiff: -1500, blueKills: 6, redKills: 9 },
  { time: 20, goldDiff: -2800, blueKills: 8, redKills: 13 },
  { time: 25, goldDiff: -1200, blueKills: 12, redKills: 15 },
  { time: 30, goldDiff: 500, blueKills: 16, redKills: 16 },
  { time: 35, goldDiff: 2800, blueKills: 21, redKills: 18 },
  { time: 40, goldDiff: 4500, blueKills: 27, redKills: 20 },
]

interface MatchMomentumProps {
  currentTime: number // in seconds
}

function interpolateData(time: number) {
  const minutes = time / 60

  // Find the two data points to interpolate between
  let lowerIndex = 0
  let upperIndex = 0

  for (let i = 0; i < momentumData.length - 1; i++) {
    if (minutes >= momentumData[i].time && minutes <= momentumData[i + 1].time) {
      lowerIndex = i
      upperIndex = i + 1
      break
    }
  }

  if (minutes >= momentumData[momentumData.length - 1].time) {
    return momentumData[momentumData.length - 1]
  }

  const lower = momentumData[lowerIndex]
  const upper = momentumData[upperIndex]
  const ratio = (minutes - lower.time) / (upper.time - lower.time)

  return {
    time: minutes,
    goldDiff: Math.round(lower.goldDiff + (upper.goldDiff - lower.goldDiff) * ratio),
    blueKills: Math.round(lower.blueKills + (upper.blueKills - lower.blueKills) * ratio),
    redKills: Math.round(lower.redKills + (upper.redKills - lower.redKills) * ratio),
  }
}

export function MatchMomentum({ currentTime }: MatchMomentumProps) {
  const currentData = interpolateData(currentTime)
  const displayMinutes = currentTime / 60

  const blueAreaData = momentumData.map((d) => ({
    ...d,
    goldDiff: d.goldDiff > 0 ? d.goldDiff : 0,
  }))

  const redAreaData = momentumData.map((d) => ({
    ...d,
    goldDiff: d.goldDiff < 0 ? d.goldDiff : 0,
  }))
  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Momentum</CardTitle>
        <CardDescription>Gold difference over time (Blue side perspective)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            goldDiff: {
              label: "Gold Difference",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={momentumData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(239, 68, 68)" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="rgb(239, 68, 68)" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="time"
                label={{ value: "Time (minutes)", position: "insideBottom", offset: -5 }}
                className="text-xs"
              />
              <YAxis label={{ value: "Gold Difference", angle: -90, position: "insideLeft" }} className="text-xs" />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
              <ReferenceLine x={displayMinutes} stroke="hsl(var(--foreground))" strokeWidth={2} strokeDasharray="5 5" />              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => {
                      if (name === "goldDiff") {
                        return ["Gold Diff"]
                      }
                      return [value, name]
                    }}
                  />
                }
              />
                <Area type="monotone" dataKey="goldDiff" data={blueAreaData} fill="url(#blueGradient)" stroke="none" />
                <Area type="monotone" dataKey="goldDiff" data={redAreaData} fill="url(#redGradient)" stroke="none" />
                <Line type="monotone" dataKey="goldDiff" stroke="white" strokeWidth={3} dot={false} />
                <Line
                    type="monotone"
                    dataKey="goldDiff"
                    data={[currentData]}
                    stroke="white"
                    strokeWidth={3}
                    dot={{ fill: "white", r: 6, strokeWidth: 2, stroke: "hsl(var(--foreground))" }}
                />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="mt-4 grid grid-cols-2 gap-4 text-center">
          <div className="rounded-lg bg-blue-500/10 p-4">
            <div className="text-2xl font-bold text-blue-500">{currentData.blueKills}</div>
            <div className="text-sm text-muted-foreground">Blue Side Kills</div>
          </div>
          <div className="rounded-lg bg-red-500/10 p-4">
            <div className="text-2xl font-bold text-red-500">{currentData.redKills}</div>
            <div className="text-sm text-muted-foreground">Red Side Kills</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
