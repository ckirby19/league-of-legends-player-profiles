import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { WinProbChart } from "./lineGraphs/WinProbability";
import { MomentumImpactChart } from "./lineGraphs/MomentumImpact";
import { AdvantageChart } from "./lineGraphs/Advantage";
import { MapVisualizer } from "./MapVisualizer";
import { TimelineControls } from "./TimelineControls";
import { MinuteSummary, TimelineData } from "../utils/types";
import { computeMinuteSummaries } from "@/utils/computeMomentum";
import { getMatchTimelineForSummonerMatch } from "@/utils/getMatchTimeline";

interface DashboardProps {
  matchId: string;
  summonerName: string;
  region: string;
  mapSrc: string;
}

export function Dashboard({ matchId, summonerName, region, mapSrc }: DashboardProps) {
  const [currentMinute, setCurrentMinute] = useState(0);
  const [summaries, setSummaries] = useState<MinuteSummary[]>([]);
  
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    async function loadTimeline() {
      // Replace with your Lambda call later
      // const res = await fetch(`/ExampleData/${matchId}.json`);
      let timeline: TimelineData;
      try {
        const fetchedTimeline = await getMatchTimelineForSummonerMatch(summonerName, region, matchId);
        if (fetchedTimeline instanceof Error) {
          console.log("Error fetching timeline:", fetchedTimeline.message);
          const res = await fetch(`/ExampleData/NA1_4916026624.json`);
          timeline = await res.json();
        }
        else{
          timeline = fetchedTimeline;
        }
  
      } catch (error) {
        console.log("Error fetching timeline");
        const res = await fetch(`/ExampleData/NA1_4916026624.json`);
        timeline = await res.json();
      }

      const parsed = computeMinuteSummaries(timeline!, 1, [1,2,3,4,5], [6,7,8,9,10]);
      setSummaries(parsed);
    }

    loadTimeline();
  }, [matchId, region, summonerName]);

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
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, summaries.length]);

  if (summaries.length === 0) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6">
      <div className="flex flex-row gap-8 w-full max-w-[1600px]">
        {/* Left column: charts */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1"
        >
          <Card className="bg-neutral-900 text-white w-full">
            <CardHeader />
            <CardContent>
              <div className="mb-10">
                <h3 className="text-lg font-semibold mb-2">Player Team Win Probability</h3>
                <WinProbChart data={summaries} currentMinute={currentMinute} />
              </div>
              <div className="mb-10">
                <h3 className="text-lg font-semibold mb-2">Momentum Impact</h3>
                <MomentumImpactChart data={summaries} currentMinute={currentMinute} />
              </div>
              <div className="mb-10">
                <h3 className="text-lg font-semibold mb-2">Team 1 Advantage</h3>
                <AdvantageChart data={summaries} currentMinute={currentMinute} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right column: map */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1"
        >
          <Card className="bg-neutral-900 text-white w-full h-full">
            <CardHeader>
              <CardTitle>Map Visualizer</CardTitle>
              <CardDescription>Player position & events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full aspect-square">
                <MapVisualizer
                  mapSrc={mapSrc}
                  summaries={summaries}
                  currentMinute={currentMinute}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-8 w-full max-w-[1200px]"
      >
        <TimelineControls
          currentMinute={currentMinute}
          duration={summaries.length - 1}
          isPlaying={isPlaying}
          onPlayToggle={() => setIsPlaying((p) => !p)}
          onSeek={setCurrentMinute}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-10 w-full max-w-[1200px]"
        >
        <h3 className="text-lg font-semibold mb-4">Play-by-Play</h3>
        <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-700 text-sm">
            <thead className="bg-neutral-800">
                <tr>
                <th className="px-4 py-2 border-b border-gray-700 text-left">Minute</th>
                <th className="px-4 py-2 border-b border-gray-700 text-left">Event</th>
                <th className="px-4 py-2 border-b border-gray-700 text-left">Analysis</th>
                </tr>
            </thead>
            <tbody>
                <tr className="hover:bg-neutral-800/50">
                <td className="px-4 py-2 border-b border-gray-700">3</td>
                <td className="px-4 py-2 border-b border-gray-700">First Blood (Mid Lane)</td>
                <td className="px-4 py-2 border-b border-gray-700">
                    Early kill gives Team 1’s mid laner lane priority and XP lead.
                </td>
                </tr>
                <tr className="hover:bg-neutral-800/50">
                <td className="px-4 py-2 border-b border-gray-700">8</td>
                <td className="px-4 py-2 border-b border-gray-700">Dragon Taken (Infernal)</td>
                <td className="px-4 py-2 border-b border-gray-700">
                    Securing the first dragon boosts scaling advantage for Team 2.
                </td>
                </tr>
                <tr className="hover:bg-neutral-800/50">
                <td className="px-4 py-2 border-b border-gray-700">15</td>
                <td className="px-4 py-2 border-b border-gray-700">Tower Destroyed (Top Lane)</td>
                <td className="px-4 py-2 border-b border-gray-700">
                    Opens up map pressure; Team 1 can now rotate top laner to Rift Herald.
                </td>
                </tr>
                <tr className="hover:bg-neutral-800/50">
                <td className="px-4 py-2 border-b border-gray-700">22</td>
                <td className="px-4 py-2 border-b border-gray-700">Baron Fight</td>
                <td className="px-4 py-2 border-b border-gray-700">
                    A 3-for-0 trade secures Baron for Team 2, swinging momentum heavily.
                </td>
                </tr>
            </tbody>
            </table>
        </div>
        </motion.div>
    </div>
  );
}
