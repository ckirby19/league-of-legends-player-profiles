import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { MinuteSummary } from "../utils/types";

interface MomentumChartProps {
  data: MinuteSummary[];
  currentMinute: number;
  onMinuteSelect: (minute: number) => void;
}

export const MomentumChart = ({
  data,
  currentMinute,
  onMinuteSelect,
}: MomentumChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis dataKey="minute" />
        <YAxis />
        <Tooltip />
        <ReferenceLine y={0} stroke="#666" />
        <Bar
          dataKey="momentumImpact"
          fill="#4f46e5"
          onClick={(entry: MinuteSummary) => onMinuteSelect(entry.minute)}
        />
        <ReferenceLine x={currentMinute} stroke="red" />
      </BarChart>
    </ResponsiveContainer>
  );
};


