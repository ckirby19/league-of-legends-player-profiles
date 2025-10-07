import { useState } from "react";
import { Banner } from "./Banner";
import { Dashboard } from "./Dashboard";
import { MatchInfo } from "../utils/types";
import { MatchSelector } from "./MatchSelector";

interface PlayerDashboardProps {
  playerName: string;
  region: string;
  matches: MatchInfo[];
  onLogout: () => void;
}

export function PlayerDashboard({ playerName, region, matches, onLogout }: PlayerDashboardProps) {
  const [selectedMatch, setSelectedMatch] = useState(matches[0]);

  return (
    <div>
      <Banner
        playerName={playerName}
        playerLogo="/player_logo.png"
        onLogout={onLogout}
      />
      <div className="flex min-h-screen bg-gray-950 text-white">
        {/* Left navbar */}
        <MatchSelector
          matches={matches}
          selectedMatchId={selectedMatch.match_id}
          onSelect={(id) => {
            const match = matches.find((m) => m.match_id === id);
            setSelectedMatch(match!);
          }}
        />

        {/* Right dashboard */}
        <div className="flex-1 p-6 bg-black overflow-y-auto">
          <Dashboard
            matchId={selectedMatch.match_id}
            summonerName={playerName}
            region={region}
            mapSrc="/minimap.png"
          />
        </div>
      </div>
    </div>
  );
}
