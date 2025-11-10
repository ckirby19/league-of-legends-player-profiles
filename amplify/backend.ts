import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { getMatchIds } from './functions/get-match-ids/resource';
import { getMatchInfo } from './functions/get-match-info/resource';
import { getMatchTimeline } from './functions/get-match-timeline/resource';
import { getMatchSummaryInsights } from './functions/get-match-summary-insight/resource';
import { getSummonerMultiMatchInsights } from './functions/get-summoner-multi-match-insights/resource';
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

export const backend = defineBackend({
  auth,
  data,
  storage,
  getMatchIds,
  getMatchInfo,
  getMatchTimeline,
  getMatchSummaryInsights,
  getSummonerMultiMatchInsights,
});

backend.getMatchSummaryInsights.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["bedrock:InvokeModel"],
    resources: [
      `arn:aws:bedrock:eu-west-2::foundation-model/mistral.mistral-7b-instruct-v0:2`,
      `arn:aws:bedrock:eu-west-2::foundation-model/anthropic.claude-3-haiku-20240307-v1:0`,
    ],
  })
);

backend.getSummonerMultiMatchInsights.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["bedrock:InvokeModel"],
    resources: [
      `arn:aws:bedrock:eu-west-2::foundation-model/mistral.mistral-7b-instruct-v0:2`,
      `arn:aws:bedrock:eu-west-2::foundation-model/anthropic.claude-3-haiku-20240307-v1:0`,
    ],
  })
);