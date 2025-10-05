import { useEffect, useState } from "react";
import { Banner } from "./graphs/Banner";
import { Dashboard } from "./graphs/Dashboard";
import { computeMinuteSummaries } from "./utils/computeMomentum";
import { MinuteSummary, TimelineData } from "./utils/types";
import { MatchInfo } from "./utils/types";

interface PlayerDashboardProps {
  playerName: string;
  region: string;
  matches: MatchInfo[];
}

export function PlayerDashboard({ playerName, region, matches }: PlayerDashboardProps) {
  const [selectedMatch, setSelectedMatch] = useState(matches[0]);
  const [summaries, setSummaries] = useState<MinuteSummary[]>([]);

  useEffect(() => {
    async function loadTimeline() {
      console.log({ region, selectedMatch });
      const res = await fetch(`/ExampleData/${selectedMatch.matchId}.json`);
      const timeline: TimelineData = await res.json();

      const parsed = computeMinuteSummaries(
        timeline,
        1,
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10]
      );
      setSummaries(parsed);
    }

    loadTimeline();
  }, [selectedMatch, region]);

  if (summaries.length === 0) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div>
      <Banner
        playerName={playerName}
        playerLogo="/player_logo.png"
        matches={matches}
        selectedMatch={selectedMatch?.matchId ?? ""}
        onSelectMatch={(id) => {
          const match = matches.find((m) => m.matchId === id) || null;
          setSelectedMatch(match!);
        }}
      />
      <Dashboard
        summaries={summaries}
        mapSrc="/minimap.png"
      />
    </div>
  );
}
