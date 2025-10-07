import {
  LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Legend
} from "recharts";
import { MinuteSummary } from "../../utils/types";

interface AdvantageChartProps {
  data: MinuteSummary[];
  currentMinute: number; // ms
}

export const AdvantageChart = ({ data, currentMinute }: AdvantageChartProps) => (
  <ResponsiveContainer width="100%" height={250}>
    <LineChart data={data}>
        <XAxis
            dataKey="minute"
            ticks={data.map(d => d.minute).filter(m => m % 2 === 0)} // only even minutes
            label={{ value: "Time (mins)", position: "insideBottom", offset: -5 }} />
        <YAxis
            label={{ value: "Advantage", angle: -90, position: "insideLeft" }}
            tickFormatter={(v) => `${v / 1000}k`}
        />
        <Tooltip />
        <Legend verticalAlign="top" height={36} />
        <Line
            type="monotone"
            dataKey="goldAdvantage"
            stroke="#F2B705"
            dot={false}
            strokeWidth={2}
            name="Gold Advantage"
        />
        <Line
            type="monotone"
            dataKey="xpAdvantage"
            stroke="#1E90FF"
            dot={false}
            strokeWidth={2}
            name="XP Advantage"
        />
        <ReferenceLine x={currentMinute} stroke="red" />
    </LineChart>
  </ResponsiveContainer>
);
