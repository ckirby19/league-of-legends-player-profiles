import { defineFunction } from "@aws-amplify/backend";

export const getSummonerMultiMatchInsights = defineFunction({
    name: "get-summoner-multi-match-insights",
    entry: './handler.ts',
    timeoutSeconds: 45,
    memoryMB: 1024,
});