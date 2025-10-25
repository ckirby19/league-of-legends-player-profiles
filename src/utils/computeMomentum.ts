// utils/computeMomentum.ts
import { TimelineData, MinuteSummary, TimelineEvent, ChampionKillEvent, BuildingKillEvent, EliteMonsterKillEvent, OriginalMapDimension, DisplayMapDimension, ParticipantFrame, MatchTimelineSummary, KeyEvent, ProbabilityChange, MatchInfo } from "./types";

function computeAdvantage(team1: number, team2: number): number {
  if (team1 + team2 === 0) return 0;
  return (team1 - team2) / (team1 + team2);
}

function pythagoreanExpectation(team1: number, team2: number, x: number): number {
  return Math.pow(team1, x) / (Math.pow(team1, x) + Math.pow(team2, x));
}

function ensureParticipantFrames(
  pf: Record<string, ParticipantFrame> | string
): Record<string, ParticipantFrame> {
  return typeof pf === "string" ? JSON.parse(pf) : pf;
}

function scalePosition(pos: { x: number; y: number } | undefined) {
  if (!pos) return undefined;
  return {
    x: (pos.x / OriginalMapDimension) * DisplayMapDimension,
    y: DisplayMapDimension - (pos.y / OriginalMapDimension) * DisplayMapDimension,
  };
}

export function computeMatchTimelineSummary(
  timeline: TimelineData,
  matchInfo: MatchInfo,
  x: number = 2, // exponent for Pythagorean expectation
  topNKeyEvents: number = 5 // number of key events to extract
): MatchTimelineSummary {
  const frames = timeline.frames.map(f => ({
    ...f,
    participantFrames: ensureParticipantFrames(f.participantFrames),
  }));


  // Identify teams and player
  const playerId = timeline.participants.find(p => p.puuid == matchInfo.playerPuuid)?.participantId;
  if (!playerId)
    throw new Error("Player not found in timeline participants");

  const playerTeamIds = timeline.participants
    .filter(p => matchInfo.playerTeamParticipants.includes(p.puuid))
    .map(p => p.participantId.toString());
  const enemyTeamIds = timeline.participants
    .filter(p => matchInfo.enemyTeamParticipants.includes(p.puuid))
    .map(p => p.participantId.toString());

  const summaries: MinuteSummary[] = [];

  frames.forEach(frame => {
    const minute = Math.floor(frame.timestamp / 60000);

    // Aggregate metrics
    const playerTeamGold = playerTeamIds.reduce((sum, id) => sum + (frame.participantFrames[id]?.totalGold || 0), 0);
    const enemyTeamGold = enemyTeamIds.reduce((sum, id) => sum + (frame.participantFrames[id]?.totalGold || 0), 0);

    const playerTeamXP = playerTeamIds.reduce((sum, id) => sum + (frame.participantFrames[id]?.xp || 0), 0);
    const enemyTeamXP = enemyTeamIds.reduce((sum, id) => sum + (frame.participantFrames[id]?.xp || 0), 0);

    const playerTeamCreepScore = playerTeamIds.reduce((sum, id) => sum + (frame.participantFrames[id]?.minionsKilled || 0), 0);
    const enemyTeamCreepScore = enemyTeamIds.reduce((sum, id) => sum + (frame.participantFrames[id]?.minionsKilled || 0), 0);

    // Advantage
    const advGold = playerTeamGold - enemyTeamGold;
    const advXP = playerTeamXP - enemyTeamXP;
    const advCreepScore = playerTeamCreepScore - enemyTeamCreepScore;

    // Normalized advantage [-1, 1]
    const normalizedAdvGold = computeAdvantage(playerTeamGold, enemyTeamGold);
    const normalizedAdvXP = computeAdvantage(playerTeamXP, enemyTeamXP);
    const normalizedAdvCreepScore = computeAdvantage(playerTeamCreepScore, enemyTeamCreepScore);

    // Winning probability per metric
    const pGold = pythagoreanExpectation(playerTeamGold, enemyTeamGold, x);
    const pXP = pythagoreanExpectation(playerTeamXP, enemyTeamXP, x);
    const pCreepScore = pythagoreanExpectation(playerTeamCreepScore, enemyTeamCreepScore, x);

    // Final probability = average
    const pFinal = (pGold + pXP + pCreepScore) / 3;

    // Player position
    const playerFrame = frame.participantFrames[playerId.toString()];
    const playerPosition = playerFrame?.position ? scalePosition(playerFrame.position) : undefined;

    summaries.push({
      minute,
      advantage: (normalizedAdvGold + normalizedAdvXP + normalizedAdvCreepScore) / 3,
      winProb: pFinal,
      playerPosition,
      goldAdvantage: advGold,
      xpAdvantage: advXP,
      creepScoreAdvantage: advCreepScore,
    });
  });

  // Compute momentum impact and populate keyEvents per summary
  for (let i = 0; i < summaries.length - 1; i++) {
    summaries[i].momentumImpact = summaries[i + 1].winProb - summaries[i].winProb;
  }

  const winningProbByMinute = new Map<number, number>();
  summaries.forEach(s => winningProbByMinute.set(s.minute, s.winProb));

  const events: KeyEvent[] = [];

  for (let i = 0; i < summaries.length; i++) {
    const current = summaries[i];
    const next = summaries[i + 1];

    // momentumImpact is change to next minute's winProb (if exists)
    if (next) {
      current.momentumImpact = next.winProb - current.winProb;
    } else {
      current.momentumImpact = 0;
    }

    // Extract KeyEvents from the corresponding frame (frames are same index order)
    const frame = frames.find(f => Math.floor(f.timestamp / 60000) === current.minute);
    if (!frame) continue;

    frame.events.forEach((ev: TimelineEvent) => {
      let isKey = false;
      let typeLabel = "";
      let desc = "";
      let evPosition: { x: number; y: number } | undefined;
      let affectedTeamIsPlayer = undefined as boolean | undefined;

      switch (ev.type) {
        case "CHAMPION_KILL": {
          const e = ev as ChampionKillEvent;
          isKey = true;
          typeLabel = "Champion Kill";
          evPosition = { x: e.position.x, y: e.position.y };
          // Determine which team secured the kill (killer might be undefined for some cases)
          if (typeof e.killerId === "number") {
            affectedTeamIsPlayer = playerTeamIds.includes(e.killerId.toString());
          }
          const killerPart = e.killerId ? `Participant ${e.killerId}` : "Unknown";
          const victimPart = e.victimId ? `Participant ${e.victimId}` : "Unknown";
          desc = `${killerPart} killed ${victimPart}`;
          break;
        }

        case "ELITE_MONSTER_KILL": {
          const e = ev as EliteMonsterKillEvent;
          isKey = true;
          typeLabel = "Objective Secured";
          evPosition = { x: e.position.x, y: e.position.y };
          affectedTeamIsPlayer = playerTeamIds.includes(e.killerId.toString());
          desc = `${affectedTeamIsPlayer ? "Player team" : "Enemy team"} took ${e.monsterType || "elite monster"}`;
          break;
        }

        case "BUILDING_KILL": {
          const e = ev as BuildingKillEvent;
          isKey = true;
          typeLabel = "Building Destroyed";
          evPosition = { x: e.position.x, y: e.position.y };
          // buildingOwner is typically the team that owned the building; killerId is attacker
          affectedTeamIsPlayer = e.killerId ? playerTeamIds.includes(e.killerId.toString()) : undefined;
          desc = `${affectedTeamIsPlayer ? "Player team" : "Enemy team"} destroyed ${e.buildingType || "building"}`;
          break;
        }
        default:
          break;
      }

      if (!isKey) return;

      // Compute probability change for the player's team: before = previous summary.winProb, after = current summary.winProb
      const beforeProb = (i > 0 ? summaries[i - 1].winProb : current.winProb);
      const afterProb = current.winProb;
      const probChange: ProbabilityChange = { before: beforeProb, after: afterProb, delta: afterProb - beforeProb };

      // Map event position to display coords
      const displayPos = evPosition ? scalePosition(evPosition) as { x: number; y: number } : { x: 0, y: 0 };

      const keyEvent: KeyEvent = {
        matchClock: new Date(frame.timestamp).toISOString().slice(11, 19), // "HH:MM:SS" from timestamp
        type: typeLabel,
        position: displayPos,
        description: desc,
        playerTeamProbabilityChange: probChange,
      };

      events.push(keyEvent);
    });
  }

  // Sort events by absolute probability change and take top N
  events.sort((a, b) => Math.abs(b.playerTeamProbabilityChange.delta) - Math.abs(a.playerTeamProbabilityChange.delta));
  const topEvents = events.slice(0, topNKeyEvents);

  return {
    playerTeamTimeline: summaries,
    keyEvents: topEvents
  } as MatchTimelineSummary;
}
