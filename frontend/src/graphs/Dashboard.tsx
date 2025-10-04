import { useState, useEffect } from "react";
import { MomentumChart } from "./MomentumChart";
import { MapVisualizer } from "./MapVisualizer";
import { TimelineControls } from "./TimelineControls";
import { MinuteSummary } from "../utils/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface DashboardProps {
  summaries: MinuteSummary[];
  mapSrc: string;
}

export const Dashboard = ({ summaries, mapSrc }: DashboardProps) => {
  const [currentMinute, setCurrentMinute] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

useEffect(() => {
  let interval: NodeJS.Timeout | undefined;

  if (isPlaying) {
    interval = setInterval(() => {
      setCurrentMinute((t) =>
        t < summaries.length - 1 ? t + 1 : t
      );
    }, 1000);
  }

  return () => {
    if (interval) {
      clearInterval(interval);
    }
  };
}, [isPlaying, summaries.length]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6">
      <h2 className="text-2xl font-bold mb-6">League Match Dashboard</h2>

      <div className="flex flex-row gap-6">
        <Card className="bg-neutral-900 text-white w-[600px]">
          <CardHeader>
            <CardTitle>Momentum Impact</CardTitle>
            <CardDescription>ΔP between minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <MomentumChart
              data={summaries}
              currentMinute={currentMinute}
              onMinuteSelect={setCurrentMinute}
            />
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 text-white w-[520px]">
          <CardHeader>
            <CardTitle>Map Visualizer</CardTitle>
            <CardDescription>Player position & events</CardDescription>
          </CardHeader>
          <CardContent>
            <MapVisualizer
              mapSrc={mapSrc}
              summaries={summaries}
              currentMinute={currentMinute}
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <TimelineControls
          currentMinute={currentMinute}
          duration={summaries.length - 1}
          isPlaying={isPlaying}
          onPlayToggle={() => setIsPlaying((p) => !p)}
          onSeek={setCurrentMinute}
        />
      </div>
    </div>
  );
};
