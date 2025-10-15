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
    <nav className="w-1/6 bg-neutral-900 text-white overflow-y-auto">
      <h3 className="px-4 py-2 font-semibold border-b border-gray-700">Recent Games</h3>
      <ul>
        {matches.map((m) => (
          <motion.li
            key={m.matchId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => onSelect(m.matchId)}
            className={`px-4 py-3 cursor-pointer border-b border-gray-800 hover:bg-neutral-800
              ${m.matchId === selectedMatchId ? "bg-neutral-700" : ""}
              ${m.win ? "text-green-400" : "text-red-400"}`}
          >
            <div className="flex justify-between items-center">
              <span className="font-bold">Champion: {m.championName}</span>
              <span className="text-sm">{Math.floor(m.gameDuration / 60)}m</span>
            </div>
            <div className="text-xs text-gray-400">
              {m.gameMode} • {m.kills}/{m.deaths}/{m.assists} KDA • {timeSince(m.gameEndTimestamp)}
            </div>
          </motion.li>
        ))}
      </ul>
    </nav>
  );
}
