import { useState } from "react";
import { motion } from "framer-motion";
import { getMatchIdsResponseForSummoner } from "../utils/getMatchIds";
import { MatchInfo } from "@/utils/types";
import { getMatchInfoForSummonerMatch } from "@/utils/getMatchInfo";

interface LoginProps {
  onLogin: (summonerName: string, region: string, matches: MatchInfo[]) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [summonerName, setSummonerName] = useState("");
  const [region, setRegion] = useState("na1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const matchIdsResponse = await getMatchIdsResponseForSummoner(summonerName, region);
      if (matchIdsResponse instanceof Error) {
        throw matchIdsResponse;
      }

      const results = await Promise.allSettled(
        matchIdsResponse.matchIds.map((id) => getMatchInfoForSummonerMatch(summonerName, region, id, matchIdsResponse.puuid))
        );

      const matches: MatchInfo[] = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value as MatchInfo);

      onLogin(summonerName, region, matches);
    } catch (error) {
      setError("Could not find summoner. Please check the name and tag.");
    } finally {
      setLoading(false);
    }
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
        <div className="flex flex-col items-center mb-6">
        <div className="text-4xl font-extrabold tracking-wide text-blue-500">
          MMD
        </div>
        <div className="text-sm text-gray-400">Match Momentum Dashboard</div>
      </div>
        <h2 className="text-xl font-semibold text-center">Search for Summoner Matches</h2>
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
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Region</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full px-3 py-2 rounded bg-neutral-800 border border-gray-700"
          >
            <option value="na1">NA1</option>
            <option value="br1">BR1</option>
            <option value="la1">LA1</option>
            <option value="la2">LA2</option>
            <option value="euw1">EUW1</option>
            <option value="eun1">EUN1</option>
            <option value="tr1">TR1</option>
            <option value="ru">RU</option>
            <option value="kr">KR</option>
            <option value="jp1">JP1</option>
            <option value="oc1">OC1</option>
            <option value="ph2">PH2</option>
            <option value="sg2">SG2</option>
            <option value="th2">TH2</option>
            <option value="tw2">TW2</option>
            <option value="vn2">VN2</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded font-semibold hover:cursor-pointer ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Please wait..." : "Search"}
        </button>
      </motion.form>
    </div>
  );
}