import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { WinProbChart } from "./lineGraphs/WinProbability";
import { MomentumImpactChart } from "./lineGraphs/MomentumImpact";
import { AdvantageChart } from "./lineGraphs/Advantage";
import { MapVisualizer } from "./MapVisualizer";
import { TimelineControls } from "./TimelineControls";
import { MatchInfo, MatchTimelineSummary, MinuteSummary, TimelineData } from "../utils/types";
import { getMatchTimelineForSummonerMatch } from "@/utils/getMatchTimeline";
import { getMatchTimelineSummaryForSummonerMatch } from "@/utils/getMatchTimelineSummary";

interface DashboardProps {
  matchInfo: MatchInfo;
  summonerName: string;
  region: string;
  mapSrc: string;
}

export function Dashboard({ matchInfo, summonerName, region, mapSrc }: DashboardProps) {
  const [currentMinute, setCurrentMinute] = useState(0);
  const [summaries, setSummaries] = useState<MinuteSummary[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    async function loadTimeline() {
      let timeline: TimelineData;
      let matchTimelineSummary: MatchTimelineSummary;
      setLoading(true);
      try {
        const fetchedTimeline = await getMatchTimelineForSummonerMatch(summonerName, region, matchInfo.matchOverview.matchId);
        if (fetchedTimeline instanceof Error) {
          console.log("Error fetching timeline:", fetchedTimeline.message);
          const res = await fetch(`/ExampleData/NA1_4916026624.json`);
          timeline = await res.json();
        }
        else{
          timeline = fetchedTimeline;

          const summary = await getMatchTimelineSummaryForSummonerMatch(
            timeline,
            matchInfo,
            summonerName,
            region,
            matchInfo.matchOverview.matchId
          );

          if (summary instanceof Error) {
            throw new Error("Error computing timeline summary: " + summary.message);
          }
          else{
            matchTimelineSummary = summary;
            setSummaries(matchTimelineSummary.playerTeamTimeline);
          }
        }
  
      } catch (error) {
        console.log("Error fetching timeline:", error);
        const res = await fetch(`/ExampleData/NA1_4916026624.json`);
        timeline = await res.json();
      } finally {
        setLoading(false);
      }

    }

    loadTimeline();
  }, [matchInfo, region, summonerName]);

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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4">
      <div className="flex flex-row gap-4 w-full">
        {/* Left column: data */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-2"
        >
          <Card className="bg-neutral-900 text-white w-full">
            <CardContent className="pt-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Player Team Advantage</h3>
                <AdvantageChart data={summaries} currentMinute={currentMinute} />
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Player Team Win Probability</h3>
                <WinProbChart data={summaries} currentMinute={currentMinute} />
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Momentum Impact</h3>
                <MomentumImpactChart data={summaries} currentMinute={currentMinute} />
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
            <CardContent className="pt-4">
              <h3 className="text-lg font-semibold mb-2">Map Visualizer - Player Position</h3>
              <div className="w-full aspect-square">
                <MapVisualizer
                  mapSrc={mapSrc}
                  summaries={summaries}
                  currentMinute={currentMinute}
                />
              </div>
              <TimelineControls
                currentMinute={currentMinute}
                duration={summaries.length - 1}
                isPlaying={isPlaying}
                onPlayToggle={() => setIsPlaying((p) => !p)}
                onSeek={setCurrentMinute}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black flex items-center justify-center z-50"
          >
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
              <span className="mt-4 text-blue-300 font-semibold">
                Loading match timeline...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
