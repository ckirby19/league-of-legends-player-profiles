import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'playerDashboardStorage',
  access: (allow) => ({
    'player-match-data/*': [
      allow.guest.to(['read', 'write']),
    ],
  })
});