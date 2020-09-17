import { PlatformId } from "@fightmegg/riot-rate-limiter";
import { RiotAPI, RiotAPITypes } from "./index";

const config: RiotAPITypes.Config = {
  cache: {
    cacheType: "ioredis",
    client: "redis://localhost:6379/1",
    ttls: {
      byMethod: {
        [RiotAPITypes.METHOD_KEY.ACCOUNT.GET_BY_PUUID]: 5000,
        [RiotAPITypes.METHOD_KEY.SUMMONER.GET_BY_SUMMONER_NAME]: 10000,
      },
    },
  },
};

const riotApi = new RiotAPI(
  "RGAPI-1e30fc1e-56a2-45c3-ac6f-861355e36b05",
  config
);

(async () => {
  try {
    const resp = await riotApi.summoner.getBySummonerName({
      region: PlatformId.EUW1,
      summonerName: "Demos Kratos",
    });
    console.log("RESP", resp);
  } catch (e) {
    console.error("ERR", e);
  }
})();
