import { useState } from "react";
import { Banner } from "./Banner";
import { SingleMatchDashboard } from "./MatchDashboard";
import { MatchInfo, MultiMatchHistory } from "../utils/types";
import { MatchSelector } from "./MatchSelector";
import { MultiMatchHistorySelector } from "./MultiMatchHistorySelector";
import { MultiMatchHistoryDashboard } from "./MultiMatchHistoryDashboard";

interface PlayerDashboardProps {
  playerName: string;
  region: string;
  matches: MatchInfo[];
  onLogout: () => void;
}

export function PlayerDashboard({ playerName, region, matches, onLogout }: PlayerDashboardProps) {
  const [selectedMatch, setSelectedMatch] = useState(matches[0]);
  const [showMultiMatchHistory, setShowMultiMatchHistory] = useState(false);
  const [multiMatchHistory, setMultiMatchHistory] = useState<MultiMatchHistory>();

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Banner
        playerName={playerName}
        playerLogo="/player_logo.png"
        onLogout={onLogout}
      />

      <div className="flex bg-black text-white">
        <div className="flex flex-col w-64 bg-gray-950">
          <MultiMatchHistorySelector
              setShowMultiMatchHistory={setShowMultiMatchHistory}
              showMultiMatchHistory={showMultiMatchHistory}
              matchSummariesReady={multiMatchHistory !== undefined}
          />
          <MatchSelector
            matches={matches}
            selectedMatchId={selectedMatch.matchOverview.matchId}
            showMultiMatchHistory={showMultiMatchHistory}
            onSelect={(id) => {
              const match = matches.find((m) => m.matchOverview.matchId === id);
              if (match) {
                setSelectedMatch(match);
              }
              setShowMultiMatchHistory(false);
            }}
          />
        </div>

        {/* Right column: dashboard */}
        <div className="flex-1 p-1 bg-black overflow-y-auto">
          {showMultiMatchHistory && multiMatchHistory ? (
            <MultiMatchHistoryDashboard
              multiMatchHistory={multiMatchHistory}
              mapSrc="/minimap.png"
            />
          ) : (
            <SingleMatchDashboard
              matches={matches}
              matchInfo={selectedMatch}
              summonerName={playerName}
              region={region}
              setMultiMatchHistory={setMultiMatchHistory}
              mapSrc="/minimap.png"
            />
          )}
        </div>
      </div>


    </div>
  );
}
