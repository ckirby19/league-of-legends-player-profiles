import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { getMatchIds } from './functions/get-match-ids/resource';
import { getMatchInfo } from './functions/get-match-info/resource';
import { getMatchTimeline } from './functions/get-match-timeline/resource';

defineBackend({
  auth,
  data,
  storage,
  getMatchIds,
  getMatchInfo,
  getMatchTimeline,
});
