import { defineFunction, secret } from '@aws-amplify/backend';

export const getMatchTimeline = defineFunction({
  name: 'get-match-timeline',
  entry: './handler.ts',
  environment: {
    RIOT_API_KEY: secret('RIOT_API_KEY')
  },
  timeoutSeconds: 30
});