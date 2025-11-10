import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { MatchHistoryStats } from "../../utils/types";

interface KillsDeathsAssistsChartProps {
  data: MatchHistoryStats[];
}

export const KillsDeathsAssistsGraph = ({ data }: KillsDeathsAssistsChartProps) => {
  // Format data to include match index
  const formattedData = data.map((stats, index) => ({
    matchIndex: index + 1,
    kills: stats.kills,
    deaths: stats.deaths,
    assists: stats.assists,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={formattedData}>
          <XAxis
            dataKey="matchIndex"
            label={{ value: "Game Number (Oldest to Newest)", position: "insideBottom", offset: -5 }}
          />
          <YAxis
          />
          <Tooltip />
          <Legend verticalAlign="top" height={36} />
          <Line
              type="linear"
              dataKey="kills"
              stroke="#147e0eff"
              dot={true}
              strokeWidth={2}
              name="Kills"
          />
          <Line
              type="linear"
              dataKey="deaths"
              stroke="#a01010ff"
              dot={true}
              strokeWidth={2}
              name="Deaths"
          />
          <Line
              type="linear"
              dataKey="assists"
              stroke="#1E90FF"
              dot={true}
              strokeWidth={2}
              name="Assists"
          />
      </LineChart>
    </ResponsiveContainer>
)};
