import { MatchIdsResponse } from "./types";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>({ authMode: "apiKey" });

async function fetchMatchIdsFromApi(summonerName: string, region: string): Promise<MatchIdsResponse | Error> {
    try {
        const { data, errors } = await client.queries.getMatchIds({
            summonerName,
            region,
        });

        if (errors || !data) {
            throw new Error("Summoner not found. Please check the name and tag.");
        }

        const matchIds = data as MatchIdsResponse;

        return matchIds;
    } catch (error) {
        throw new Error("Summoner not found. Please check the name and tag.");
    }
}

export async function getMatchIdsResponseForSummoner(summonerName: string, region: string): Promise<MatchIdsResponse | Error> {

    return await fetchMatchIdsFromApi(summonerName, region);
}
