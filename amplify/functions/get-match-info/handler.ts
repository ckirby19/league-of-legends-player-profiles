import type { Schema } from "../../data/resource"
import fetch from 'node-fetch';
import { getRoutingValue } from '../common';

interface MatchResponse {
  info: MatchInfoDto
}

interface MatchInfoDto {
  gameMode: string;
  gameDuration: number; // seconds
  gameEndTimestamp: number; // epoch ms
  participants: ParticipantDto[]
  teams: TeamDto[]
}

interface ParticipantDto {
  puuid: string;
  role: string;
  championName: string;
  win: boolean;
  teamId: string; // 100 or 200
  kills: number;
  deaths: number;
  assists: number;
  summonerLevel: number;
  goldEarned: number;
  totalMinionsKilled: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  visionScore: number;
}

interface TeamDto {
  teamId: string; // 100 or 200
  win: boolean;
  objectives: ObjectivesDto;
}

interface ObjectivesDto {
  baron: ObjectiveDto;
  champion: ObjectiveDto;
  dragon: ObjectiveDto;
  horde: ObjectiveDto;
  inhibitor: ObjectiveDto;
  riftHerald: ObjectiveDto;
  tower: ObjectiveDto;
}

interface ObjectiveDto {
  kills: number;
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
    const playerParticipant = info.participants.find((p: ParticipantDto) => p.puuid === puuid);

    if (!playerParticipant) throw new Error("Participant not found");

    const playerTeamId = playerParticipant.teamId;
    const playerTeamParticipants: ParticipantDto[] = [];
    const enemyTeamParticipants: ParticipantDto[] = [];

    for (const p of info.participants) {
      if (p.teamId === playerTeamId) {
        playerTeamParticipants.push(p);
      } else {
        enemyTeamParticipants.push(p);
      }
    }

    const playerTeam = info.teams.find(t => t.teamId === playerTeamId);
    const enemyTeam = info.teams.find(t => t.teamId !== playerTeamId);

    if (!playerTeam || !enemyTeam)
      throw new Error("Team data not found");

    // Conversion into the MatchInfo type
    const matchOverview = {
      matchId: matchId,
      gameMode: info.gameMode,
      gameDurationSeconds: info.gameDuration,
      gameEndTimestampEpochMs: info.gameEndTimestamp,
    };

    const playerTeamStats = {
      totalKills: playerTeamParticipants.reduce((sum, p) => sum + p.kills, 0),
      totalDeaths: playerTeamParticipants.reduce((sum, p) => sum + p.deaths, 0),
      totalAssists: playerTeamParticipants.reduce((sum, p) => sum + p.assists, 0),
      objectives: {
        barons: playerTeam.objectives.baron.kills,
        champions: playerTeam.objectives.champion.kills,
        dragons: playerTeam.objectives.dragon.kills,
        hordes: playerTeam.objectives.horde.kills,
        inhibitors: playerTeam.objectives.inhibitor.kills,
        riftHeralds: playerTeam.objectives.riftHerald.kills,
        towers: playerTeam.objectives.tower.kills,
      },
      participants: playerTeamParticipants,
    };

    const enemyTeamStats = {
      totalKills: enemyTeamParticipants.reduce((sum, p) => sum + p.kills, 0),
      totalDeaths: enemyTeamParticipants.reduce((sum, p) => sum + p.deaths, 0),
      totalAssists: enemyTeamParticipants.reduce((sum, p) => sum + p.assists, 0),
      objectives: {
        barons: enemyTeam.objectives.baron.kills,
        champions: enemyTeam.objectives.champion.kills,
        dragons: enemyTeam.objectives.dragon.kills,
        hordes: enemyTeam.objectives.horde.kills,
        inhibitors: enemyTeam.objectives.inhibitor.kills,
        riftHeralds: enemyTeam.objectives.riftHerald.kills,
        towers: enemyTeam.objectives.tower.kills,
      },
      participants: enemyTeamParticipants,
    };

    const matchInfo = {
      playerPuuid: puuid,
      matchOverview: matchOverview,
      teamStats: {
        playerTeam: playerTeamStats,
        enemyTeam: enemyTeamStats,
      },
      playerTeamId: playerTeamId,
      playerTeamParticipants: playerTeamParticipants.map(p => p.puuid),
      enemyTeamParticipants: enemyTeamParticipants.map(p => p.puuid),
      playerStats: playerParticipant,
    };

    return matchInfo;

  } catch (err) {
    throw new Error('Internal server error');
  }
};
