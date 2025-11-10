import { Stage, Layer, Image as KonvaImage, Circle, Rect} from "react-konva";
import useImage from "use-image";
import { DisplayMapDimension, Frame, MinuteSummary, SpatialTemporalEvent, TimelineData, getPlayerKDAEvents } from "../utils/types";
import { EventCategories, getColour, getEventType, scalePositionToMapDisplay } from "@/utils/helpers";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { KDEHeatmap } from "./KDEHeatmap";

interface MapVisualizerProps {
  playerPuuid: string;
  mapSrc: string;
  summaries: MinuteSummary[];
  timeline: TimelineData;
  currentMinute: number;
}

export const MapVisualizer = ({ playerPuuid, mapSrc, summaries, timeline, currentMinute }: MapVisualizerProps) => {
  const [map] = useImage(mapSrc);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    championKill: true,
    otherKill: true,
    playerDeath: true,
    championAssist: true,
    otherAssist: true,
  });

  const summary = summaries.find((s) => s.minute === currentMinute);

  const currentMs = currentMinute * 60 * 1000;

  const playerId = timeline.participants.find(p => p.puuid == playerPuuid)?.participantId;
  if (!playerId)
    throw new Error("Player not found in timeline participants");

  // All frames up to the current timestamp
  const visibleFrames: Frame[] = timeline.frames.filter(
    (f) => f.timestamp <= 2 * currentMs
  );

  // Collect all events with positions up to this time
  const visibleEvents: SpatialTemporalEvent[] = visibleFrames.flatMap((f) =>
    getPlayerKDAEvents(f.events, playerId)
  ).map((e) => ({
    ...e,
    position: scalePositionToMapDisplay(e.position),
  }));

  const filteredVisibleEvents = visibleEvents.filter((e) => {
    const eventType = getEventType(e, playerId);
    switch (eventType) {
      case EventCategories.championKill:
        return enabled.championKill;
      case EventCategories.otherKill:
        return enabled.otherKill;
      case EventCategories.playerDeath:
        return enabled.playerDeath;
      case EventCategories.championAssist:
        return enabled.championAssist;
      case EventCategories.otherAssist:
        return enabled.otherAssist;
      default:
        return true;
    }
  });

  // Gather positions for KDE
  const points = summaries.filter((s) => s.minute <= currentMinute)
    .map((s) => s.playerPosition)
    .filter((p): p is { x: number; y: number } => !!p);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Stage width={DisplayMapDimension} height={DisplayMapDimension}>
        <Layer>
          <KonvaImage image={map} width={DisplayMapDimension} height={DisplayMapDimension} />
          {!showHeatmap && summary?.playerPosition && (
            <Circle
              x={summary.playerPosition.x}
              y={summary.playerPosition.y}
              radius={DisplayMapDimension / 70 }
              fill="red"
            />
          )}
          <AnimatePresence>
            {filteredVisibleEvents.map((event, idx) => {
                const colour = getColour(event, playerId);
                return (
                  <Rect
                    key={idx}
                    x={event.position.x}
                    y={event.position.y}
                    height={DisplayMapDimension / 30}
                    width={DisplayMapDimension / 30}
                    fill={colour}
                  />
                );
              })}
          </AnimatePresence>
          <AnimatePresence>
            {showHeatmap && points.length > 0 && (
              <KDEHeatmap
                points={points}
                width={DisplayMapDimension}
                height={DisplayMapDimension}
                bandwidth={50}
                gridSize={64}
                opacity={0.5}
              />
            )}
          </AnimatePresence>
        </Layer>
      </Stage>
    <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", gap: "20px" }}>
        {Object.entries(EventCategories).map(([key, { label, colour }]) => (
          <label key={key} style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={enabled[key]}
              onChange={() => setEnabled((prev) => ({ ...prev, [key]: !prev[key] }))}
              style={{ width: "20px", height: "20px", cursor: "pointer"  }}
            />
            <span style={{ color: colour, fontSize: "20px" }}>■</span>
            <span>{label}</span>
          </label>
        ))}
      </div>

      <div style={{ display: "flex" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={showHeatmap}
            onChange={(e) => setShowHeatmap(e.target.checked)}
            style={{ width: "20px", height: "20px", cursor: "pointer" }}
          />
          <span>Show Player Position Heatmap</span>
        </label>
      </div>
      </div>
    </div>
  );
};
