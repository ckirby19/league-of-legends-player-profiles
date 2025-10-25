import { motion } from "framer-motion";
import { MatchInfo } from "../utils/types";

interface MatchSelectorProps {
  matches: MatchInfo[];
  selectedMatchId: string | null;
  onSelect: (id: string) => void;
}

function timeSince(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    return `${diffDays}d ago`;
  }
}

export function MatchSelector({ matches, selectedMatchId, onSelect }: MatchSelectorProps) {
  return (
    <nav className="w-64 bg-neutral-900 text-white flex flex-col h-full"> 
      <div className="sticky top-0 z-10 bg-neutral-900 border-b border-gray-700">
        <h3 className="px-4 py-2 font-semibold">20 Most Recent Games</h3>
      </div>
      <ul className="flex-1 overflow-y-auto overflow-y-scrollbar">
        {matches.map((m) => (
          <motion.li
            key={m.matchOverview.matchId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => onSelect(m.matchOverview.matchId)}
            className={`px-4 py-3 cursor-pointer border-b border-gray-800 hover:bg-neutral-800
              ${m.matchOverview.matchId === selectedMatchId ? "bg-neutral-700" : ""}
              ${m.playerStats.win ? "text-green-400" : "text-red-400"}`}
          >
            <div className="flex justify-between items-center">
              <span className="font-bold">Champion: {m.playerStats.championName}</span>
              <span className="text-sm">{Math.floor(m.matchOverview.gameDurationSeconds / 60)}m</span>
            </div>
            <div className="text-xs text-gray-400">
              {m.matchOverview.gameMode} • {m.playerStats.kills}/{m.playerStats.deaths}/{m.playerStats.assists} KDA • {timeSince(m.matchOverview.gameEndTimestampEpochMs)}
            </div>
          </motion.li>
        ))}
      </ul>
    </nav>
  );
}
