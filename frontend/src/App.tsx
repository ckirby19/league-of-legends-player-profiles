import { useState } from "react";
import { MatchInfo } from "./utils/types";
import { Login } from "./Login";
import { PlayerDashboard } from "./PlayerDashboard";

function App() {
  const [matches, setMatches] = useState<MatchInfo[]>([]);
  const [playerName, setPlayerName] = useState<string>("");
  const [region, setRegion] = useState<string | null>(null);

  function onLogin(summonerName: string, region: string, matches: MatchInfo[]) {
    const nameOnly = summonerName.split("#")[0];
    setPlayerName(nameOnly);
    setRegion(region);
    setMatches(matches);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {!playerName
      ? <Login onLogin={onLogin} />
      : <PlayerDashboard playerName={playerName} region={region!} matches={matches} />}
    </div>
  );
}

export default App;
