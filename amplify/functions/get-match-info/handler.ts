import type { Schema } from "../../data/resource"
import fetch from 'node-fetch';
import { getRoutingValue } from '../common';

interface MatchResponse {
  info: MatchInfoDto
}

interface MatchInfoDto {
  gameMode: string;
  queueId: number;
  gameDuration: number; // seconds
  gameEndTimestamp: number; // epoch ms
  participants: ParticipantDto[]
}

interface ParticipantDto {
  teamId: string
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  win: boolean;
  puuid: string
}

export const handler: Schema["getMatchInfo"]["functionHandler"] = async (event) => {
  try {
    const { matchId, puuid, region } = event.arguments;

    if (!matchId) throw new Error("Match Id is required");
    if (!puuid) throw new Error("Puuid is required");

    const apiKey = process.env.RIOT_API_KEY;
    if (!apiKey) {
      throw new Error('Missing Riot API key in environment');
    }

    const routingValue = getRoutingValue(region ?? 'na1');

    // Get Match info
    const matchUrl = `https://${routingValue}.api.riotgames.com/lol/match/v5/matches/${matchId}`;

    const matchRes = await fetch(matchUrl, {
      headers: { "X-Riot-Token": apiKey },
    });

    if (!matchRes.ok) throw new Error("Failed to fetch match data");

    const matchData = (await matchRes.json()) as MatchResponse;
    const info = matchData.info;
    const participant = info.participants.find((p: ParticipantDto) => p.puuid === puuid);

    if (!participant) throw new Error("Participant not found");

    const playerTeamId = participant.teamId;
    const playerTeamParticipants: string[] = [];
    const enemyTeamParticipants: string[] = [];

    for (const p of info.participants) {
      if (p.teamId === playerTeamId) {
        playerTeamParticipants.push(p.puuid);
      } else {
        enemyTeamParticipants.push(p.puuid);
      }
    }

    return {
      playerPuuid: puuid,
      matchId,
      gameMode: info.gameMode,
      queueId: info.queueId,
      gameDuration: info.gameDuration,
      gameEndTimestamp: info.gameEndTimestamp,
      championName: participant.championName,
      kills: participant.kills,
      deaths: participant.deaths,
      assists: participant.assists,
      win: participant.win,
      playerTeamId,
      playerTeamParticipants,
      enemyTeamParticipants,
    };

  } catch (err) {
    throw new Error('Internal server error');
  }
};
