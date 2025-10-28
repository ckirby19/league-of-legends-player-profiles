import { useEffect, useState } from "react";
import type { MatchSummary } from "../utils/types";
import { generateClient } from "aws-amplify/data";
import { Schema } from "amplify/data/resource";

const client = generateClient<Schema>({ authMode: "apiKey" });
    
interface InsightsPanelProps {
  matchSummary: MatchSummary;
}

export const InsightsPanel = ({ matchSummary }: InsightsPanelProps) => {
  const [insights, setInsights] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchInsights() {
      try {
        setLoading(true);

        const { data, errors } = await client.queries.generateMatchSummaryInsights({
          prompt: JSON.stringify(matchSummary),
        });

        if (errors){
          console.log(`Errors generating insights: ${errors.map(e => e.message).join(", ")}`);
          return;
        }

        if (!data) {
            console.log("Errors generating insights.");
            return;
        }

        setInsights(data);
      } catch (err) {
        console.log(`Error generating insights: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    }

    if (matchSummary) {
      fetchInsights();
    }
  }, [matchSummary]);

  return (
    <div className="mt-4 p-4 rounded-lg bg-neutral-900 text-white shadow">
      <h3 className="text-lg font-semibold mb-2">AI Insights</h3>
      {loading &&  <p className="text-gray-400">Analyzing match data…</p>}
      {!loading && insights != undefined && insights != "" && (
      <p className="whitespace-pre-line">{insights}</p>)}
    </div>
  );
}
