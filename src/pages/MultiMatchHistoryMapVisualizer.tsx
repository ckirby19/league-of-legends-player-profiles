import { Stage, Layer, Image as KonvaImage, Rect} from "react-konva";
import useImage from "use-image";
import { DisplayMapDimension, MatchEventsForPlayer, SpatialTemporalEvent } from "../utils/types";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { KDEHeatmap } from "./KDEHeatmap";
import { EventCategories, getColour, getEventType} from "@/utils/helpers";

interface MultiMatchHistoryMapVisualizerProps {
  mapSrc: string;
  multiMatchPlayerEvents: Record<number, MatchEventsForPlayer>; // keyed by timeline matchId
}

export const MultiMatchHistoryMapVisualizer = ({ mapSrc, multiMatchPlayerEvents }: MultiMatchHistoryMapVisualizerProps) => {
  const [map] = useImage(mapSrc);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    championKill: true,
    otherKill: true,
    playerDeath: true,
    championAssist: true,
    otherAssist: true,
  });

  // Gather positions for KDE
  const points = Object.values(multiMatchPlayerEvents)
    .flatMap((matchEventsForPlayer) => matchEventsForPlayer.events)
    .map((e) => e.position)
    .filter((p): p is { x: number; y: number } => !!p);

  function getFilterStatus(e: SpatialTemporalEvent, playerId: number) : boolean {
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
    }

    return true;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Stage width={DisplayMapDimension} height={DisplayMapDimension}>
        <Layer>
          <KonvaImage image={map} width={DisplayMapDimension} height={DisplayMapDimension} />
          <AnimatePresence>
            {Object.entries(multiMatchPlayerEvents).map(
                ([matchId, matchEventsForPlayer]) =>
                  matchEventsForPlayer.events.map((event, idx) => {
                    const playerId = matchEventsForPlayer.playerParticipantId as number;
                    const colour = getColour(event, playerId);
                    const filterStatus = getFilterStatus(event, playerId);
                    if (!filterStatus) return null;
                    return (
                      <Rect
                        key={`${matchId}-${idx}`}
                        x={event.position.x}
                        y={event.position.y}
                        height={DisplayMapDimension / 30}
                        width={DisplayMapDimension / 30}
                        fill={colour}
                      />
                    );
                  })
              )}
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
            <span>Show Player Events Heatmap</span>
          </label>
        </div>
      </div>
    </div>
  );
};