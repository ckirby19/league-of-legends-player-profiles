import { defineFunction, secret } from '@aws-amplify/backend';

export const getMatchInfo = defineFunction({
  name: 'get-match-info',
  entry: './handler.ts',
  environment: {
    RIOT_API_KEY: secret('RIOT_API_KEY')
  },
});