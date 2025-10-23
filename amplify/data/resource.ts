import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { getMatchIds as getMatchIdsFn } from "../functions/get-match-ids/resource";
import { getMatchInfo as getMatchInfoFn } from "../functions/get-match-info/resource";
import { getMatchTimeline as getMatchTimelineFn } from "../functions/get-match-timeline/resource";

const schema = a.schema({
  MatchInfoResult: a.customType({
    puuid: a.string(),
    matchIds: a.string().array(),
  }),
  MatchInfo: a.customType({
    playerPuuid: a.string(),
    matchId: a.string(),
    gameMode: a.string(),
    queueId: a.integer(),
    gameDuration: a.integer(),
    gameEndTimestamp: a.float(),
    championName: a.string(),
    kills: a.integer(),
    deaths: a.integer(),
    assists: a.integer(),
    win: a.boolean(),
    playerTeamId: a.string(),
    playerTeamParticipants: a.string().array(),
    enemyTeamParticipants: a.string().array(),
  }),
  // Timeline data types
  Participant: a.customType({
    participantId: a.integer(),
    puuid: a.string(),
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
  MatchTimeline: a.customType({
    timeline: a.ref("TimelineData")
  }),
  getMatchIds: a
    .query()
    .arguments({
      summonerName: a.string(),
      region: a.string(),
    })
    .returns(a.ref("MatchInfoResult"))
    .authorization((allow) => [allow.publicApiKey(), allow.guest(), allow.authenticated()])
    .handler(a.handler.function(getMatchIdsFn)),
  getMatchInfo: a
    .query()
    .arguments({
      matchId: a.string(),
      puuid: a.string(),
      region: a.string(),
    })
    .returns(a.ref("MatchInfo"))
    .authorization((allow) => [allow.publicApiKey(), allow.guest(), allow.authenticated()])
    .handler(a.handler.function(getMatchInfoFn)),
  getMatchTimeline: a
    .query()
    .arguments({
      matchId: a.string(),
      region: a.string(),
    })
    .returns(a.ref("MatchTimeline"))
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