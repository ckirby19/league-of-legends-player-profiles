import { useState } from "react";
import { MatchInfoResponse } from "./utils/types";
import { Login } from "./pages/Login";
import { PlayerDashboard } from "./pages/PlayerDashboard";

function App() {
  const [matches, setMatches] = useState<MatchInfoResponse | null>(null);
  const [summonerName, setSummonerName] = useState<string>("");
  const [region, setRegion] = useState<string | null>(null);

  function onLogin(summonerName: string, region: string, matches: MatchInfoResponse) {
    setSummonerName(summonerName);
    setRegion(region);
    setMatches(matches);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {!summonerName
      ? <Login onLogin={onLogin} />
      : <PlayerDashboard playerName={summonerName} region={region!} matches={matches!.match_info} />}
    </div>
  );
}

export default App;
