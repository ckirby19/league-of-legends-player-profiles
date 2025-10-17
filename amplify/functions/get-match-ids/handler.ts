import type { Schema } from "../../data/resource"
import fetch from 'node-fetch';
import { getRoutingValue } from '../common';

interface AccountResponse {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export const handler: Schema["getMatchIds"]["functionHandler"] = async (event) => {
  try {
    const { summonerName, region } = event.arguments;

    if (!summonerName) {
      throw new Error("Summoner name is required");
    }

    if (!summonerName.includes('#')) {
        throw new Error("Summoner name must include tag (e.g., 'Player#NA1')");
    }

    const apiKey = process.env.RIOT_API_KEY;
    if (!apiKey) {
      throw new Error('Missing Riot API key in environment');
    }

    const [gameName, tagLine] = summonerName.split('#', 2);
    const routingValue = getRoutingValue(region ?? 'na1');

    // Step 1: Get account PUUID
    const accountUrl = `https://${routingValue}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
      gameName
    )}/${encodeURIComponent(tagLine)}`;

    const accountRes = await fetch(accountUrl, {
      headers: { 'X-Riot-Token': apiKey },
    });

    if (accountRes.status === 404) {
      throw new Error('RIOT ID not found');}
    if (!accountRes.ok) {
      throw new Error(`Failed to fetch account: ${accountRes.status}`);
    }

    const accountData: AccountResponse = await accountRes.json() as AccountResponse;
    const puuid = accountData.puuid;

    // Step 2: Get match IDs
    const matchUrl = `https://${routingValue}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20`;
    const matchRes = await fetch(matchUrl, { headers: { 'X-Riot-Token': apiKey } });

    if (!matchRes.ok) {
      throw new Error('Failed to fetch summoner data');
    }

    const matchIds: string[] = await matchRes.json() as string[];

    return { puuid, matchIds };

  } catch (err) {
    throw new Error('Internal server error');
  }
};
