import { Stage, Layer, Image as KonvaImage, Circle} from "react-konva";
import useImage from "use-image";
import { DisplayMapDimension, MinuteSummary } from "../utils/types";

interface MapVisualizerProps {
  mapSrc: string;
  summaries: MinuteSummary[];
  currentMinute: number;
}

export const MapVisualizer = ({ mapSrc, summaries, currentMinute }: MapVisualizerProps) => {
  const [map] = useImage(mapSrc);
  const summary = summaries.find((s) => s.minute === currentMinute);

  return (
    <Stage width={DisplayMapDimension} height={DisplayMapDimension}>
      <Layer>
        <KonvaImage image={map} width={DisplayMapDimension} height={DisplayMapDimension} />
        {summary?.playerPosition && (
          <Circle
            x={summary.playerPosition.x}
            y={summary.playerPosition.y}
            radius={DisplayMapDimension / 70 }
            fill="red"
          />
        )}
      </Layer>
    </Stage>
  );
};
