// types.ts
export interface TimelineData {
  frameInterval: number;
  frames: Frame[];
  gameId: number;
  participants: Participant[];
}

export interface Participant {
  participantId: number;
  puuid: string;
}

export interface Frame {
  timestamp: number;
  participantFrames: Record<string, ParticipantFrame>;
  events: TimelineEvent[];
}

export interface ParticipantFrame {
  participantId: number;
  position?: { x: number; y: number };
  minionsKilled: number;
  totalGold: number;
  xp: number;
}

export interface MinuteSummary {
  minute: number;
  advantage: number;          // normalized advantage
  winProb: number;            // P(t)
  momentumImpact?: number;    // P(t+1) - P(t)
  playerPosition?: { x: number; y: number };
  goldAdvantage: number;      // playerTeamGold - enemyTeamGold
  xpAdvantage: number;        // playerTeamXP - enemyTeamXP
  creepScoreAdvantage: number; // playerTeamCreepScore - enemyTeamCreepScore
}

export type TimelineEvent =
  | ChampionKillEvent
  | WardPlacedEvent
  | WardKillEvent
  | BuildingKillEvent
  | EliteMonsterKillEvent
  | ItemEvent
  | SkillLevelUpEvent
  | LevelUpEvent
  | GameEndEvent;

export interface BaseEvent {
  timestamp: number;
  type: string;
}

export interface EventWithPosition {
  position: { x: number; y: number };
}

export interface SpatialTemporalEvent extends BaseEvent, EventWithPosition {}

export interface ChampionKillEvent extends SpatialTemporalEvent {
  type: "CHAMPION_KILL";
  killerId: number;
  victimId: number;
  assistingParticipantIds?: number[];
}

export interface WardPlacedEvent extends SpatialTemporalEvent {
  type: "WARD_PLACED";
  creatorId: number;
  wardType: string;
}

export interface WardKillEvent extends SpatialTemporalEvent {
  type: "WARD_KILL";
  killerId: number;
  wardType: string;
}

export interface BuildingKillEvent extends SpatialTemporalEvent {
  type: "BUILDING_KILL";
  killerId: number;
  assistingParticipantIds?: number[];
  buildingType: string; // e.g. "TOWER_BUILDING", "INHIBITOR_BUILDING"
  laneType: string;
  teamId: number;
}

export interface EliteMonsterKillEvent extends SpatialTemporalEvent {
  type: "ELITE_MONSTER_KILL";
  killerId: number;
  assistingParticipantIds?: number[];
  monsterType: string; // e.g. "DRAGON", "BARON_NASHOR", "RIFTHERALD"
  monsterSubType?: string; // e.g. "AIR_DRAGON", "FIRE_DRAGON"
  teamId?: number;
}

export interface ItemEvent extends BaseEvent {
  type: "ITEM_PURCHASED" | "ITEM_SOLD" | "ITEM_DESTROYED" | "ITEM_UNDO";
  participantId: number;
  itemId: number;
  beforeId?: number; // for ITEM_UNDO
  afterId?: number;  // for ITEM_UNDO
}

export interface SkillLevelUpEvent extends BaseEvent {
  type: "SKILL_LEVEL_UP";
  participantId: number;
  skillSlot: number;
  levelUpType: "NORMAL" | "EVOLVE";
}

export interface LevelUpEvent extends BaseEvent {
  type: "LEVEL_UP";
  participantId: number;
  level: number;
}

export interface GameEndEvent extends BaseEvent {
  type: "GAME_END";
  winningTeam: number;
}

// --- PlayerEvent (subset for map rendering) ---
export interface PlayerEvent {
  type: "CHAMPION_KILL" | "ELITE_MONSTER_KILL" | "BUILDING_KILL" | "WARD_PLACED" | "WARD_KILL";
  position: { x: number; y: number };
  description?: string; // e.g. "Killed Ahri", "Took Dragon"
}

export function hasPosition(
  e: TimelineEvent
): e is ChampionKillEvent | WardPlacedEvent | WardKillEvent | BuildingKillEvent | EliteMonsterKillEvent {
  return (
    "position" in e &&
    e.position !== undefined &&
    e.position !== null
  );
}

export function getSpatialTemporalEvents(
  events: TimelineEvent[]
): SpatialTemporalEvent[] {
  return events.filter(hasPosition);
}

export function getPlayerKDAEvents(
  events: TimelineEvent[],
  playerId: number
): SpatialTemporalEvent[] {
  return events.filter((e) => hasPosition(e) && isPlayerKDAEvent(e, playerId));
}

export function isPlayerKDAEvent(
  e: SpatialTemporalEvent,
  playerId: number
): e is ChampionKillEvent | BuildingKillEvent | EliteMonsterKillEvent {
  switch (e.type) {
    case "ELITE_MONSTER_KILL": {
      const ev = e as EliteMonsterKillEvent;
      return (
        ev.killerId === playerId ||
        (ev.assistingParticipantIds?.includes(playerId) ?? false)
      );
    }

    case "BUILDING_KILL": {
      const ev = e as BuildingKillEvent;
      return (
        ev.killerId === playerId ||
        (ev.assistingParticipantIds?.includes(playerId) ?? false)
      );
    }
    case "CHAMPION_KILL": {
      const ev = e as ChampionKillEvent;
      return (
        ev.killerId === playerId ||
        ev.victimId === playerId ||
        (ev.assistingParticipantIds?.includes(playerId) ?? false)
      );
    }
    default:
      return false;
  }
}

export interface MatchIdsResponse {
  puuid: string;
  matchIds: string[];
}

export const OriginalMapDimension = 16000; // Original map size in Riot data
export const DisplayMapDimension = 400;    // Display size in pixels

/// Defining a new schema which will be used for the match summary data to go to LLMs

export interface MatchSummary {
  matchInfo: MatchInfo;
  matchTimelineSummary: MatchTimelineSummary;
}

export interface MatchInfo {
  playerPuuid: string;
  matchOverview: MatchOverview;
  teamStats: Teams;
  playerTeamId: string; // 100 or 200
  playerTeamParticipants: string[]; // puuids
  enemyTeamParticipants: string[];  // puuids
  playerStats: ParticipantStats;
}

export interface MatchOverview {
  matchId: string;
  gameMode: string;
  gameDuration: number; // in seconds
  gameEndTimestamp: number; // epoch ms
}

export interface Teams {
  playerTeam: TeamStats;
  enemyTeam: TeamStats;
}

export interface TeamStats {
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  objectives: Objectives;
  participants: ParticipantStats[];
}

export interface Objectives {
  barons: number;
  champions: number;
  dragons: number;
  hordes: number;
  inhibitors: number;
  riftHeralds: number;
  towers: number;
}

export interface ParticipantStats {
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

// MatchTimeline

export interface MatchTimelineSummary {
  playerTeamTimeline: MinuteSummary[];
  keyEvents: KeyEvent[];
}

export interface KeyEvent {
  matchClock: string; // "HH:MM:SS"
  type: string; // e.g "Objective Secured"
  position: { x: number; y: number }; // map coordinates of the event
  description: string; // e.g. "Player team killed Ahri", "Enemy team took Dragon"
  playerTeamProbabilityChange: ProbabilityChange;
}

export interface ProbabilityChange {
  before: number;
  after: number;
  delta: number;
}

// Match History
export interface MultiMatchHistory {
  winRate: number;
  statsPerMatch: MatchHistoryStats[];
  playerEventsAcrossMatches: Record<number, MatchEventsForPlayer>; // keyed by timeline matchId
  historyInsights: string;
}

export interface MatchEventsForPlayer {
  playerParticipantId: number;
  events: SpatialTemporalEvent[];
}

export interface MatchHistoryStats {
  kills: number;
  deaths: number;
  assists: number;
  goldEarned: number;
  xpEarned: number;
}

export interface MultiMatchHistoryInputData {
  matchHistories: MatchHistory[];
}

export interface MatchHistory {
  summary: MatchSummary;
  timeline: TimelineData;
}