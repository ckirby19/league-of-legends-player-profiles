import { DisplayMapDimension, Frame, OriginalMapDimension } from "./types";

export function getInterpolatedPosition(frames: Frame[], playerId: number, currentTime: number) {
  const frameInterval = 60000;
  const idx = Math.floor(currentTime / frameInterval);
  const f1 = frames[idx];
  const f2 = frames[idx + 1];
  if (!f1 || !f2) return undefined;

  const t1 = f1.timestamp;
  const t2 = f2.timestamp;
  const ratio = (currentTime - t1) / (t2 - t1);

  const p1 = f1.participantFrames[playerId.toString()]?.position;
  const p2 = f2.participantFrames[playerId.toString()]?.position;
  if (!p1 || !p2) return undefined;

  return {
    x: ((p1.x + (p2.x - p1.x) * ratio) / OriginalMapDimension) * DisplayMapDimension,
    y: ((p1.y + (p2.y - p1.y) * ratio) / OriginalMapDimension) * DisplayMapDimension,
  };
}
