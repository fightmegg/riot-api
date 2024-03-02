import "jest-extended";
import { PlatformId, RiotAPI } from "../../src/index";

jest.unmock("@fightmegg/riot-rate-limiter");

const riotAPIKey = process.env.X_RIOT_API_KEY || "";

describe("E2E", () => {
  describe("Match V5", () => {
    test("getIdsbyPuuid", async () => {
      const rAPI = new RiotAPI(riotAPIKey);

      const resp = await rAPI.matchV5.getIdsByPuuid({
        cluster: PlatformId.EUROPE,
        puuid:
          "8bJQbDi6uFIgefQA6Y79yxff_1bCHNopb1eHlq3p7Ic2oeXgYTvNnfGahtWyJ6qqAue3uK6wiZmMWQ",
        params: {
          start: 0,
          count: 5,
        },
      });
      expect(resp).toHaveLength(5);
    });

    test("getMatchById", async () => {
      const rAPI = new RiotAPI(riotAPIKey);

      const matchIds = await rAPI.matchV5.getIdsByPuuid({
        cluster: PlatformId.EUROPE,
        puuid:
          "8bJQbDi6uFIgefQA6Y79yxff_1bCHNopb1eHlq3p7Ic2oeXgYTvNnfGahtWyJ6qqAue3uK6wiZmMWQ",
        params: {
          start: 0,
          count: 5,
        },
      });

      const resp = await rAPI.matchV5.getMatchById({
        cluster: PlatformId.EUROPE,
        matchId: matchIds[0],
      });

      expect(resp).toContainAllKeys(["metadata", "info"]);
      expect(resp.info).toContainAllKeys([
        "endOfGameResult",
        "gameCreation",
        "gameDuration",
        "gameId",
        "gameMode",
        "gameName",
        "gameEndTimestamp",
        "gameStartTimestamp",
        "gameType",
        "gameVersion",
        "mapId",
        "participants",
        "platformId",
        "queueId",
        "teams",
        "tournamentCode",
      ]);
      expect(resp.metadata.matchId).toEqual(matchIds[0]);
    });

    test("getMatchTimelineById", async () => {
      const rAPI = new RiotAPI(riotAPIKey);

      const matchIds = await rAPI.matchV5.getIdsByPuuid({
        cluster: PlatformId.EUROPE,
        puuid:
          "8bJQbDi6uFIgefQA6Y79yxff_1bCHNopb1eHlq3p7Ic2oeXgYTvNnfGahtWyJ6qqAue3uK6wiZmMWQ",
        params: {
          start: 0,
          count: 5,
        },
      });

      const resp = await rAPI.matchV5.getMatchTimelineById({
        cluster: PlatformId.EUROPE,
        matchId: matchIds[0],
      });
      expect(resp).toContainAllKeys(["metadata", "info"]);
      expect(resp.info).toContainAnyKeys([
        "frameInterval",
        "frames",
        "gameId",
        "participants",
      ]);
      expect(resp.metadata.matchId).toEqual(matchIds[0]);
    });
  });
});
