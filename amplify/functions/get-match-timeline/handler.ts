import type { Schema } from "../../data/resource"
import fetch from 'node-fetch';
import { getRoutingValue } from '../common';
import type { Json } from "@aws-amplify/data-schema";

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

    const timeline = await res.json() as Json;

    return { timeline: timeline };

  } catch (err) {
    throw new Error('Internal server error');
  }
};
