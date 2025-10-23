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
  totalGold: number;
  xp: number;
}

export interface MinuteSummary {
  minute: number;
  advantage: number;          // normalized advantage
  winProb: number;            // P_final(t)
  momentumImpact?: number;    // ΔP between t and t+1
  playerPosition?: { x: number; y: number };
  playerEvents: PlayerEvent[];
  goldAdvantage: number;      // team1Gold - team2Gold
  xpAdvantage: number;        // team1XP - team2XP
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

export interface ChampionKillEvent extends BaseEvent {
  type: "CHAMPION_KILL";
  killerId: number;
  victimId: number;
  assistingParticipantIds?: number[];
  position: { x: number; y: number };
}

export interface WardPlacedEvent extends BaseEvent {
  type: "WARD_PLACED";
  creatorId: number;
  wardType: string;
  position: { x: number; y: number };
}

export interface WardKillEvent extends BaseEvent {
  type: "WARD_KILL";
  killerId: number;
  wardType: string;
  position: { x: number; y: number };
}

export interface BuildingKillEvent extends BaseEvent {
  type: "BUILDING_KILL";
  killerId: number;
  assistingParticipantIds?: number[];
  buildingType: string; // e.g. "TOWER_BUILDING", "INHIBITOR_BUILDING"
  laneType: string;
  position: { x: number; y: number };
  teamId: number;
}

export interface EliteMonsterKillEvent extends BaseEvent {
  type: "ELITE_MONSTER_KILL";
  killerId: number;
  assistingParticipantIds?: number[];
  monsterType: string; // e.g. "DRAGON", "BARON_NASHOR", "RIFTHERALD"
  monsterSubType?: string; // e.g. "AIR_DRAGON", "FIRE_DRAGON"
  position: { x: number; y: number };
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

export interface MatchInfo {
  playerPuuid: string;
  matchId: string;
  gameMode: string;
  queueId: number;
  gameDuration: number; // seconds
  gameEndTimestamp: number; // epoch ms
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  win: boolean;
  playerTeamId: string; // 100 or 200
  playerTeamParticipants: string[]; // puuids
  enemyTeamParticipants: string[];  // puuids
}

export interface MatchIdsResponse {
  puuid: string;
  matchIds: string[];
}

export const OriginalMapDimension = 16000; // Original map size in Riot data
export const DisplayMapDimension = 400;    // Display size in pixels
