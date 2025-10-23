import { useState } from "react";
import { Login } from "./pages/Login";
import { PlayerDashboard } from "./pages/PlayerDashboard";
import { MatchInfo } from "./utils/types";

function App() {
  const [matches, setMatches] = useState<MatchInfo[] | null>(null);
  const [summonerName, setSummonerName] = useState<string>("");
  const [region, setRegion] = useState<string | null>(null);

  function onLogin(summonerName: string, region: string, matches: MatchInfo[]) {
    setSummonerName(summonerName);
    setRegion(region);
    setMatches(matches);
  }

  function onLogout(){
    setSummonerName("");
    setRegion(null);
    setMatches(null);
  }

  const isLoggedIn = !!summonerName && region !== null && matches !== null && matches.length > 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {!isLoggedIn
      ? <Login onLogin={onLogin} />
      : <PlayerDashboard
          playerName={summonerName}
          region={region!}
          matches={matches!} 
          onLogout={onLogout}
        />}
    </div>
  );
}

export default App;
