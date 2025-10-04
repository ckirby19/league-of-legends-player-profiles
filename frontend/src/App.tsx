import { useEffect, useState } from "react";
import { Dashboard } from "./graphs/Dashboard";
import { computeMinuteSummaries } from "./utils/computeMomentum";
import { MinuteSummary, TimelineData } from "./utils/types";

function App() {
  const [summaries, setSummaries] = useState<MinuteSummary[]>([]);

  useEffect(() => {
    async function loadTimeline() {
      // Fetch timeline JSON (proxy through your backend to Riot API)
      // const res = await fetch("/api/matches/NA1_1234567890/timeline");
      // const timeline: TimelineData = await res.json();
      const res = await fetch("/ExampleData/timeline.json");
      const timeline: TimelineData = await res.json();

      // Example: assume playerId = 1, team1 = [1..5], team2 = [6..10]
      const parsed = computeMinuteSummaries(timeline, 1, [1,2,3,4,5], [6,7,8,9,10]);
      setSummaries(parsed);
    }

    loadTimeline();
  }, []);

  if (summaries.length === 0) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <Dashboard
      summaries={summaries}
      mapSrc="/minimap.png"
    />
  );
}

export default App;
