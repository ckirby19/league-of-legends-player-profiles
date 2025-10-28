import { defineFunction } from "@aws-amplify/backend";

export const getMatchSummaryInsights = defineFunction({
    name: "get-match-summary-insights",
    entry: './handler.ts',
    timeoutSeconds: 45,
    memoryMB: 1024,
});