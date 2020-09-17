jest.unmock("@fightmegg/riot-rate-limiter");

import "jest-extended";
import { PlatformId, RiotAPI } from "../../src/index";

const riotAPIKey = process.env.X_RIOT_API_KEY || "";

describe("E2E", () => {
  describe("Summoner", () => {
    test("getBySummonerName", async () => {
      const rAPI = new RiotAPI(riotAPIKey);

      const resp = await rAPI.summoner.getBySummonerName({
        region: PlatformId.EUW1,
        summonerName: "Demos Kratos",
      });
      expect(resp.name).toEqual("Demos Kratos");
      expect(resp).toContainAllKeys([
        "id",
        "accountId",
        "puuid",
        "name",
        "profileIconId",
        "revisionDate",
        "summonerLevel",
      ]);
    });
  });
});
