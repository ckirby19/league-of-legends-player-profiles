import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { getMatchIds as getMatchIdsFn } from "../functions/get-match-ids/resource";
import { getMatchInfo as getMatchInfoFn } from "../functions/get-match-info/resource";
import { getMatchTimeline as getMatchTimelineFn } from "../functions/get-match-timeline/resource";

const schema = a.schema({
  MatchIdsResult: a.customType({
    puuid: a.string(),
    matchIds: a.string().array(),
  }),
  MatchInfoResult: a.customType({
    playerPuuid: a.string(),
    matchOverview: a.ref("MatchOverview"),
    teamStats: a.ref("Teams"),
    playerTeamId: a.string(),
    playerTeamParticipants: a.string().array(),
    enemyTeamParticipants: a.string().array(),
    playerStats: a.ref("ParticipantStats"),
  }),
  MatchOverview: a.customType({
    matchId: a.string(),
    gameMode: a.string(),
    gameDuration: a.integer(), // in seconds
    gameEndTimestamp: a.float(), // epoch ms
  }),
  Teams: a.customType({
    playerTeam: a.ref("TeamStats"),
    enemyTeam: a.ref("TeamStats"),
  }),
  TeamStats: a.customType({
    totalKills: a.integer(),
    totalDeaths: a.integer(),
    totalAssists: a.integer(),
    objectives: a.ref("Objectives"),
    participants: a.ref("ParticipantStats").array(),
  }),
  Objectives: a.customType({
    barons: a.integer(),
    champions: a.integer(),
    dragons: a.integer(),
    hordes: a.integer(),
    inhibitors: a.integer(),
    riftHeralds: a.integer(),
    towers: a.integer(),
  }),
  ParticipantStats: a.customType({
    puuid: a.string(),
    role: a.string(),
    championName: a.string(),
    win: a.boolean(),
    teamId: a.string(), // 100 or 200
    kills: a.integer(),
    deaths: a.integer(),
    assists: a.integer(),
    summonerLevel: a.integer(),
    goldEarned: a.integer(),
    totalMinionsKilled: a.integer(),
    totalDamageDealt: a.integer(),
    totalDamageTaken: a.integer(),
    visionScore: a.integer(),
  }),

  // Timeline data types
  MatchTimelineResult: a.customType({
    timeline: a.ref("TimelineData")
  }),
  ParticipantFrame: a.customType({
    participantId: a.integer(),
    position: a.customType({
      x: a.integer(),
      y: a.integer(),
    }),
    totalGold: a.integer(),
    xp: a.integer(),
  }),
  TimelineEvent: a.customType({
    timestamp: a.float(),
    type: a.string(),

    // Shared fields
    position: a.customType({
      x: a.integer(),
      y: a.integer(),
    }),

    // ChampionKillEvent
    killerId: a.integer(),
    victimId: a.integer(),
    assistingParticipantIds: a.integer().array(),

    // WardPlacedEvent
    creatorId: a.integer(),
    wardType: a.string(),

    // BuildingKillEvent
    buildingType: a.string(),
    laneType: a.string(),
    teamId: a.integer(),

    // EliteMonsterKillEvent
    monsterType: a.string(),
    monsterSubType: a.string(),

    // ItemEvent
    participantId: a.integer(),
    itemId: a.integer(),
    beforeId: a.integer(),
    afterId: a.integer(),

    // SkillLevelUpEvent
    skillSlot: a.integer(),
    levelUpType: a.string(),

    // LevelUpEvent
    level: a.integer(),

    // GameEndEvent
    winningTeam: a.integer(),
  }),
  Frame: a.customType({
    timestamp: a.float(),
    participantFrames: a.json(),
    events: a.ref("TimelineEvent").array(),
  }),
  TimelineData: a.customType({
    frameInterval: a.integer(),
    frames: a.ref("Frame").array(),
    gameId: a.float(),
    participants: a.ref("Participant").array(),
  }),
  Participant: a.customType({
    participantId: a.integer(),
    puuid: a.string(),
  }),
  getMatchIds: a
    .query()
    .arguments({
      summonerName: a.string(),
      region: a.string(),
    })
    .returns(a.ref("MatchIdsResult"))
    .authorization((allow) => [allow.publicApiKey(), allow.guest(), allow.authenticated()])
    .handler(a.handler.function(getMatchIdsFn)),
  getMatchInfo: a
    .query()
    .arguments({
      matchId: a.string(),
      puuid: a.string(),
      region: a.string(),
    })
    .returns(a.ref("MatchInfoResult"))
    .authorization((allow) => [allow.publicApiKey(), allow.guest(), allow.authenticated()])
    .handler(a.handler.function(getMatchInfoFn)),
  getMatchTimeline: a
    .query()
    .arguments({
      matchId: a.string(),
      region: a.string(),
    })
    .returns(a.ref("MatchTimelineResult"))
    .authorization((allow) => [allow.publicApiKey(), allow.guest(), allow.authenticated()])
    .handler(a.handler.function(getMatchTimelineFn)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});