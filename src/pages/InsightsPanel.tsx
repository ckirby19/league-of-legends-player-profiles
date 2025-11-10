import { useEffect, useState } from "react";
import type { MatchSummary } from "../utils/types";
import { getMatchSummaryInsights } from "@/utils/getMatchSummaryInsights";

interface InsightsPanelProps {
  matchSummary: MatchSummary;
  summonerName: string;
  region: string;
}

export const InsightsPanel = ({ matchSummary, summonerName, region }: InsightsPanelProps) => {
  const [insights, setInsights] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchInsights() {
      try {
        setLoading(true);

        const fetchedInsights = await getMatchSummaryInsights(summonerName, region, matchSummary);

        if (fetchedInsights instanceof Error){
          console.log("Errors generating insights", fetchedInsights.message);
          return;
        }
        else{
          setInsights(fetchedInsights);
        }

      } catch (err) {
        console.log(`Error generating insights: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    }

    if (matchSummary) {
      fetchInsights();
    }
  }, [matchSummary, region, summonerName]);

  return (
    <div className="mt-4 p-4 rounded-lg bg-neutral-900 text-white shadow">
      <h3 className="text-lg font-semibold mb-2">AI Insights</h3>
      {loading &&  <p className="text-gray-400">Analyzing match data…</p>}
      {!loading && insights != undefined && insights != "" && (
      <p className="whitespace-pre-line">{insights}</p>)}
    </div>
  );
}
