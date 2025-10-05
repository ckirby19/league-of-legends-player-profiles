import { useState } from "react";
import { MatchInfo } from "./utils/types";
import { motion } from "framer-motion";

interface LoginProps {
  onLogin: (summonerName: string, region: string, matches: MatchInfo[]) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [summonerName, setSummonerName] = useState("");
  const [region, setRegion] = useState("na1");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);


    try {
      const res = await fetch(
        "https://xzbgxt4nchpvoirutenu25mc640rfhwd.lambda-url.eu-west-2.on.aws/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ summonerName, region }),
        }
      );
      
      const data = await res.json();
      console.log("Lambda output:", data);
    } catch (error) {
      console.error("Error calling Lambda:", error);
    }
    finally {
      setLoading(false);
    }

    const matches: MatchInfo[] = [
      { matchId: "NA1_4916026624", label: "Match 1 vs XYZ" },
      { matchId: "NA1_123", label: "Match 2 vs ABC" },
    ];

    onLogin(summonerName, region, matches);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-neutral-900 p-6 rounded shadow-md w-96 space-y-4"
      >
        <h2 className="text-xl font-semibold text-center">Log In</h2>

        <div>
          <label className="block text-sm mb-1">
            Summoner Name (GameName#TAG)
          </label>
          <input
            type="text"
            value={summonerName}
            onChange={(e) => setSummonerName(e.target.value)}
            className="w-full px-3 py-2 rounded bg-neutral-800 border border-gray-700"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Region</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full px-3 py-2 rounded bg-neutral-800 border border-gray-700"
          >
            <option value="na1">NA1</option>
            <option value="euw1">EUW1</option>
            <option value="kr">KR</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded font-semibold ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Please wait..." : "Log In"}
        </button>
      </motion.form>
    </div>
  );
}