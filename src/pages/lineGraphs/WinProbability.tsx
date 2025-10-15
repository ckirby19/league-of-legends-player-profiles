import {
  LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer
} from "recharts";
import { MinuteSummary } from "../../utils/types";

interface WinProbChartProps {
  data: MinuteSummary[];
  currentMinute: number;
}

export const WinProbChart = ({ data, currentMinute }: WinProbChartProps) => (
  <ResponsiveContainer width="100%" height={200}>
    <LineChart data={data}>
      <XAxis
        dataKey="minute"
        ticks={data.map(d => d.minute).filter(m => m % 2 === 0)} // only even minutes
        label={{ value: "Time (mins)", position: "insideBottom", offset: -5 }}
      />
      <YAxis
        domain={[0.25, 0.75]}
        ticks={[0.25, 0.5, 0.75]}
        tickFormatter={(v) => `${Math.round(v * 100)}%`} 
      />
      <Tooltip formatter={(v: number) => `${(v * 100).toFixed(1)}%`} />
      <Line
        type="monotone"
        dataKey="winProb"
        stroke="#FFD700"
        dot={false}
        strokeWidth={2}
        name="Win Probability"
      />
      <ReferenceLine x={currentMinute} stroke="red" />
      <ReferenceLine y={0.5} stroke="white" strokeDasharray="5 5" />
    </LineChart>
  </ResponsiveContainer>
);
