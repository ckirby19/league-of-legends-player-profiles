import { MatchIdsResponse } from "./types";

async function fetchMatchIdsFromApi(summonerName: string, region: string): Promise<MatchIdsResponse | Error> {
    try {
        const res = await fetch(
            "https://643gadjzjgkvjjttooabzekobm0shxfe.lambda-url.eu-west-2.on.aws/",
            {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ summonerName, region }),
            }
        );
        if (!res.ok) {
            throw new Error("Summoner not found. Please check the name and tag.");
        }
        const data = await res.json();

        if (!data || data.length === 0) {
            throw new Error("Summoner not found. Please check the name and tag.");
        }
        // Cache the fetched data in S3 for future requests
        console.log("Fetched match IDs:", data);
        const matchIds = data as MatchIdsResponse;

        return matchIds;
    } catch (error) {
        throw new Error("Summoner not found. Please check the name and tag.");
    }
}

export async function getMatchIdsResponseForSummoner(summonerName: string, region: string): Promise<MatchIdsResponse | Error> {

    return await fetchMatchIdsFromApi(summonerName, region);
}
