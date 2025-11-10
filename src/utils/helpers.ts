import { BuildingKillEvent, ChampionKillEvent, DisplayMapDimension, EliteMonsterKillEvent, OriginalMapDimension, SpatialTemporalEvent } from "./types";

export function scalePositionToMapDisplay(pos: { x: number; y: number }) {
  return {
    x: (pos.x / OriginalMapDimension) * DisplayMapDimension,
    y: DisplayMapDimension - (pos.y / OriginalMapDimension) * DisplayMapDimension,
  };
}

export const ChampionKillColour = "#03ff6cff";
export const OtherKillColour = "#d6d31aff";
export const PlayerDeathColour = "#e00f0fff";
export const ChampionAssistColour = "#0019faff";
export const OtherAssistColour = "#11e0d6ff";

export const EventCategories = {
  championKill: { label: "Champion Kill", colour: ChampionKillColour },
  otherKill: { label: "Other Kill", colour: OtherKillColour },
  playerDeath: { label: "Player Death", colour: PlayerDeathColour },
  championAssist: { label: "Champion Assist", colour: ChampionAssistColour },
  otherAssist: { label: "Other Assist", colour: OtherAssistColour },
};

export function getColour(e: SpatialTemporalEvent, playerId: number) {
  switch (e.type) {
    case "CHAMPION_KILL":
      return classifyChampionKillEvent(e as ChampionKillEvent, playerId);
    case "BUILDING_KILL":
    case "ELITE_MONSTER_KILL":
      return classifyOtherKillEvent(e as BuildingKillEvent | EliteMonsterKillEvent, playerId);
  }
}

export function getEventType(e: SpatialTemporalEvent, playerId: number) {
  switch (e.type) {
    case "CHAMPION_KILL": {
      const ck = e as ChampionKillEvent;
      if (ck.killerId === playerId) {
        return EventCategories.championKill;
      }
      if (ck.victimId === playerId) {
        return EventCategories.playerDeath;
      }
      if (ck.assistingParticipantIds?.includes(playerId)) {
        return EventCategories.championAssist;
      }
      break;
    }
    case "BUILDING_KILL": {
      const bk = e as BuildingKillEvent;
      if (bk.killerId == playerId) {
        return EventCategories.otherKill;
      }
      if (bk.assistingParticipantIds?.includes(playerId)) {
        return EventCategories.otherAssist;
      }
      break;
    }
    case "ELITE_MONSTER_KILL": {
      const em = e as EliteMonsterKillEvent;
      if (em.killerId == playerId) {
        return EventCategories.otherKill;
      }
      if (em.assistingParticipantIds?.includes(playerId)) {
        return EventCategories.otherAssist;
      }
      break;
    }
  }
}

export function classifyChampionKillEvent(e: ChampionKillEvent, playerId: number) {
  if (e.killerId === playerId) {
    return ChampionKillColour;
  }
  if (e.victimId === playerId) {
    return PlayerDeathColour;
  }
  if (e.assistingParticipantIds?.includes(playerId)) {
    return ChampionAssistColour;
  }
}

export function classifyOtherKillEvent(e: BuildingKillEvent | EliteMonsterKillEvent, playerId: number ) {
  if (e.killerId == playerId) {
    return OtherKillColour;
  }
  if (e.assistingParticipantIds?.includes(playerId)) {
    return OtherAssistColour;
  }
}