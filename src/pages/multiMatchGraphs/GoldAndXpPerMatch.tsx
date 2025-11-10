import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { MatchHistoryStats } from "../../utils/types";

interface GoldAndXpChartProps {
  data: MatchHistoryStats[] ;
}

export const GoldAndXpGraph = ({ data }: GoldAndXpChartProps) => {
  // Format data to include match index
  const formattedData = data.map((stats, index) => ({
    matchIndex: index + 1,
    gold: stats.goldEarned,
    xp: stats.xpEarned
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={formattedData}>
          <XAxis
            dataKey="matchIndex"
            label={{ value: "Game Number (Oldest to Newest)", position: "insideBottom", offset: -5 }}
          />
          <YAxis
            tickFormatter={(v) => `${v / 1000}k`}
          />
          <Tooltip />
          <Legend verticalAlign="top" height={36} />
          <Line
              type="linear"
              dataKey="gold"
              stroke="#F2B705"
              dot={true}
              strokeWidth={2}
              name="Gold Earned"
          />
          <Line
              type="linear"
              dataKey="xp"
              stroke="#1E90FF"
              dot={true}
              strokeWidth={2}
              name="XP Earned"
          />
      </LineChart>
    </ResponsiveContainer>
)};