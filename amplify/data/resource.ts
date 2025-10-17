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
    gameEndTimestamp: a.integer(),
    championName: a.string(),
    kills: a.integer(),
    deaths: a.integer(),
    assists: a.integer(),
    win: a.boolean(),
    playerTeamId: a.string(),
    playerTeamParticipants: a.string().array(),
    enemyTeamParticipants: a.string().array(),
  }),
  MatchTimeline: a.customType({
    timeline: a.json()
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