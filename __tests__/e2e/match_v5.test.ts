jest.unmock("@fightmegg/riot-rate-limiter");

import { count } from "console";
import "jest-extended";
import { PlatformId, RiotAPI } from "../../src/index";

const riotAPIKey = process.env.X_RIOT_API_KEY || "";

describe("E2E", () => {
  describe("Match V5", () => {
    test("getIdsbyPuuid", async () => {
      const rAPI = new RiotAPI(riotAPIKey);

      const resp = await rAPI.matchV5.getIdsbyPuuid({
        cluster: PlatformId.EUROPE,
        puuid: "iGWKyE9MjG-aUw0KaYRvH4V2iEZwM14fbDr4Qlx0JVLOzlMqSbmQWpfbOsJPFK_dZabRH9cP7kqz5g",
        params: {
          start: 0,
          count: 5
        }
      });
      expect(resp).toHaveLength(5)
    });

    test("getMatchById", async () => {
      const rAPI = new RiotAPI(riotAPIKey);

      const matchId = "EUW1_5350514472"

      const resp = await rAPI.matchV5.getMatchById({
        cluster: PlatformId.EUROPE,
        matchId,
      });
      expect(resp).toContainAllKeys([
        "metadata",
        "info"
      ])
      expect(resp.metadata.matchId).toEqual(matchId)
    });
  });
});
