import { Stage, Layer, Image as KonvaImage, Circle} from "react-konva";
import useImage from "use-image";
import { MinuteSummary } from "../utils/types";

interface MapVisualizerProps {
  mapSrc: string;
  summaries: MinuteSummary[];
  currentMinute: number;
}

export const MapVisualizer = ({ mapSrc, summaries, currentMinute }: MapVisualizerProps) => {
  const [map] = useImage(mapSrc);
  const summary = summaries.find((s) => s.minute === currentMinute);

  return (
    <Stage width={500} height={500}>
      <Layer>
        <KonvaImage image={map} width={500} height={500} />
        {summary?.playerPosition && (
          <Circle
            x={summary.playerPosition.x}
            y={summary.playerPosition.y}
            radius={8}
            fill="red"
            shadowBlur={10}
          />
        )}
      </Layer>
    </Stage>
  );
};
