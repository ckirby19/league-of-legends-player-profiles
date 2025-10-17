import { defineFunction, secret } from '@aws-amplify/backend';

export const getMatchIds = defineFunction({
  name: 'get-match-ids',
  entry: './handler.ts',
  environment: {
    RIOT_API_KEY: secret('RIOT_API_KEY')
  },
});