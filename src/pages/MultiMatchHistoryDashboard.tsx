import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { MultiMatchHistory } from "@/utils/types";
import { GoldAndXpGraph } from "./multiMatchGraphs/GoldAndXpPerMatch";
import { KillsDeathsAssistsGraph } from "./multiMatchGraphs/KillsDeathsAssistsPerMatch";
import { MultiMatchHistoryMapVisualizer } from "./MultiMatchHistoryMapVisualizer";

interface MultiMatchHistoryDashboardProps {
  mapSrc: string;
  multiMatchHistory: MultiMatchHistory;
}

export function MultiMatchHistoryDashboard({ mapSrc, multiMatchHistory }: MultiMatchHistoryDashboardProps) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4">
      <div className="flex flex-row gap-4 w-full">
        {/* Left column: Data Visualization */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-2"
        >
          <Card className="bg-neutral-900 text-white w-full">
            <CardContent className="pt-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Gold and XP Per Match</h3>
                <GoldAndXpGraph data={multiMatchHistory.statsPerMatch} />
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Kills, Deaths & Assists Per Match</h3>
                <KillsDeathsAssistsGraph data={multiMatchHistory.statsPerMatch} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right column: Heatmap */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1"
        >
          <Card className="bg-neutral-900 text-white w-full h-full">
            <CardContent className="pt-4">
              <h3 className="text-lg font-semibold mb-2">Map Visualizer - Events Heatmap </h3>
              <div className="w-full">
                {multiMatchHistory && <MultiMatchHistoryMapVisualizer
                  mapSrc={mapSrc}
                  multiMatchPlayerEvents={multiMatchHistory.playerEventsAcrossMatches}
                />}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="flex flex-row mt-4 w-full">
        {/* Bottom: AI Insights Panel */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1"
        >
          <Card className="bg-neutral-900 text-white w-full h-full">
            <CardContent className="pt-4">
              <div className="mt-4 p-4 rounded-lg bg-neutral-900 text-white shadow">
                <h3 className="text-lg font-semibold mb-2">AI Insights</h3>
                <p className="whitespace-pre-line">{multiMatchHistory.historyInsights}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
