jest.unmock("@fightmegg/riot-rate-limiter");

import "jest-extended";
import { PlatformId, RiotAPI } from "../../src/index";

const riotAPIKey = process.env.X_RIOT_API_KEY || "";
const puuid = process.env.PUUID || "";

describe("E2E", () => {
  describe("Summoner", () => {
    test("getByPUUID", async () => {
      const rAPI = new RiotAPI(riotAPIKey);

      const resp = await rAPI.summoner.getByPUUID({
        region: PlatformId.EUW1,
        puuid,
      });
      expect(resp.puuid).toEqual(puuid);
      expect(resp).toContainAllKeys([
        "puuid",
        "profileIconId",
        "revisionDate",
        "summonerLevel",
      ]);
    });
  });
});
