import { useEffect, useState } from "react";
import { Dashboard } from "./graphs/Dashboard";
import { computeMinuteSummaries } from "./utils/computeMomentum";
import { MinuteSummary, TimelineData } from "./utils/types";
import { Banner } from "./graphs/Banner";

function App() {
  const [selectedMatch, setSelectedMatch] = useState("match1");
  const [summaries, setSummaries] = useState<MinuteSummary[]>([]);

  const matches = [
    { id: "match1", label: "Match 1 vs XYZ" },
    { id: "match2", label: "Match 2 vs ABC" },
  ];

  useEffect(() => {
    async function loadTimeline() {
      // Fetch timeline JSON (proxy through your backend to Riot API)
      // const res = await fetch("/api/matches/NA1_1234567890/timeline");
      // const timeline: TimelineData = await res.json();
      const res = await fetch(`/ExampleData/${selectedMatch}.json`);
      const timeline: TimelineData = await res.json();

      // Example: assume playerId = 1, team1 = [1..5], team2 = [6..10]
      const parsed = computeMinuteSummaries(timeline, 1, [1,2,3,4,5], [6,7,8,9,10]);
      setSummaries(parsed);
    }

    loadTimeline();
  }, [selectedMatch]);

  if (summaries.length === 0) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Banner
        playerName="Samson"
        playerLogo="/player_logo.png"
        matches={matches}
        selectedMatch={selectedMatch}
        onSelectMatch={setSelectedMatch}
      />
      <Dashboard
        summaries={summaries}
        mapSrc="/minimap.png"
      />
    </div>
  );
}

export default App;
