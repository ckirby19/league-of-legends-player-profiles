import { MatchInfo } from "@/utils/types";

interface BannerProps {
  playerName: string;
  playerLogo: string; // URL or path to logo image
  matches: MatchInfo[];
  selectedMatch: string;
  onSelectMatch: (id: string) => void;
}

export function Banner({
  playerName,
  playerLogo,
  matches,
  selectedMatch,
  onSelectMatch,
}: BannerProps) {
  return (
    <div className="w-full bg-gray-900 text-white flex items-center justify-between px-6 py-3 shadow-md">
      {/* Left side: Title */}
      <div className="text-xl font-bold tracking-wide">
        LoL Match Momentum Dashboard
      </div>

      {/* Right side: Welcome + logo + match selector */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm">Welcome {playerName}</span>
          <img
            src={playerLogo}
            alt={`${playerName} logo`}
            className="w-8 h-8 rounded-full border border-gray-600"
          />
        </div>

        {/* Match selector */}
        <select
          value={selectedMatch}
          onChange={(e) => onSelectMatch(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
        >
          {matches.map((m) => (
            <option key={m.matchId} value={m.matchId}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
