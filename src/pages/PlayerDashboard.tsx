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
    <div className="min-h-screen flex flex-col">
      <Banner
        playerName={playerName}
        playerLogo="/player_logo.png"
        onLogout={onLogout}
      />

      <div className="flex bg-gray-950 text-white" style={{ height: "100vh" }}>
        <MatchSelector
          matches={matches}
          selectedMatchId={selectedMatch.matchOverview.matchId}
          onSelect={(id) => {
            const match = matches.find((m) => m.matchOverview.matchId === id);
            if (match) setSelectedMatch(match);
          }}
        />

        <div className="flex-1 p-1 bg-gray-950">
          <Dashboard
            matchInfo={selectedMatch}
            summonerName={playerName}
            region={region}
            mapSrc="/minimap.png"
          />
        </div>
      </div>
    </div>
  );
}
