import {
  LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer
} from "recharts";
import { MinuteSummary } from "../../utils/types";

interface MomentumImpactChartProps {
  data: MinuteSummary[];
  currentMinute: number;
}

export const MomentumImpactChart = ({ data, currentMinute }: MomentumImpactChartProps) => (
  <ResponsiveContainer width="100%" height={150}>
    <LineChart data={data}>
      <XAxis
        dataKey="minute"
        ticks={data.map(d => d.minute).filter(m => m % 2 === 0)} // only even minutes
      />
      <YAxis />
      <Tooltip />
      <Line
        type="monotone"
        dataKey="momentumImpact"
        stroke="#FF4500"
        dot={false}
        strokeWidth={2}
        name="Momentum Impact"
      />
      <ReferenceLine x={currentMinute} stroke="red" />
    </LineChart>
  </ResponsiveContainer>
);
