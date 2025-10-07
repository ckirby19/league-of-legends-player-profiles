import { useState } from "react";

interface MatchInputProps {
  onSubmit: (summonerId: string, matchId: string) => void;
}

export const MatchInput = ({ onSubmit }: MatchInputProps) => {
  const [summonerId, setSummonerId] = useState("");
  const [matchId, setMatchId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (summonerId && matchId) {
      onSubmit(summonerId, matchId);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
      <div>
        <label>
          Summoner ID:
          <input
            type="text"
            value={summonerId}
            onChange={(e) => setSummonerId(e.target.value)}
            placeholder="Enter Summoner ID"
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
      </div>
      <div style={{ marginTop: "0.5rem" }}>
        <label>
          Match ID:
          <input
            type="text"
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            placeholder="Enter Match ID"
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
      </div>
      <button className="hover:cursor-pointer" type="submit" style={{ marginTop: "0.75rem" }}>
        Load Match Data
      </button>
    </form>
  );
};
