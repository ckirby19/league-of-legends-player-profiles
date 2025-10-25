import type { Schema } from "../../data/resource"
import fetch from 'node-fetch';
import { getRoutingValue } from '../common';
import type { ParticipantFrame, TimelineData } from "../../../src/utils/types";

interface TimelineResponse {
  metadata: {
    dataVersion: string,
    matchId: string,
    participants: string[]
  },
  info: TimelineData
}

function normalizeParticipantFrames(
  raw: Record<string, ParticipantFrame>
): Record<string, ParticipantFrame> {
  return Object.fromEntries(
    Object.entries(raw).map(([id, pf]) => [
      id,
      {
        participantId: pf.participantId,
        position: pf.position,
        minionsKilled: pf.minionsKilled,
        totalGold: pf.totalGold,
        xp: pf.xp,
      },
    ])
  );
}

export const handler: Schema["getMatchTimeline"]["functionHandler"] = async (event) => {
  try {
    const { matchId, region } = event.arguments;

    if (!matchId) throw new Error("Match Id is required");

    const apiKey = process.env.RIOT_API_KEY;
    if (!apiKey) {
      throw new Error('Missing Riot API key in environment');
    }

    const routingValue = getRoutingValue(region ?? 'na1');

    const timelineUrl = `https://${routingValue}.api.riotgames.com/lol/match/v5/matches/${matchId}/timeline`;

    const res = await fetch(timelineUrl, {
      headers: { "X-Riot-Token": apiKey },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch timeline: ${res.status}`);
    }

    const raw = (await res.json()) as TimelineResponse;

    const timeline: TimelineData = {
      ...raw.info,
      frames: raw.info.frames.map(frame => ({
        timestamp: frame.timestamp,
        events: frame.events,
        participantFrames: normalizeParticipantFrames(frame.participantFrames),
      })),
    };

    return { timeline: timeline };

  } catch (err) {
    throw new Error('Internal server error');
  }
};
