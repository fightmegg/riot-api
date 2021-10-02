import { RiotRateLimiter } from "@fightmegg/riot-rate-limiter";
import { RiotAPI, RiotAPITypes, PlatformId } from "../../src/index";
import { MemoryCache, RedisCache } from "../../src/cache";
import { DDragon } from "../../src/ddragon";

jest.mock("../../src/cache", () => {
  return {
    MemoryCache: jest.fn(() => ({
      get: jest.fn(),
      set: jest.fn(),
      flush: jest.fn(),
    })),
    RedisCache: jest.fn(() => ({
      get: jest.fn(),
      set: jest.fn(),
      flush: jest.fn(),
    })),
  };
});

describe("RiotAPI", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const getKeyValue = <T extends object, U extends keyof T>(obj: T) => (
    key: U
  ) => obj[key];

  describe("constructor", () => {
    test("should THROW if no token provided", () => {
      expect(() => new RiotAPI("")).toThrowError(new Error("token is missing"));
    });

    test("should call initialize a new RiotRateLimiter", () => {
      new RiotAPI("1234");

      expect(RiotRateLimiter).toHaveBeenCalledWith({
        concurrency: 10,
        datastore: "local",
        redis: undefined,
      });
    });

    test("should set defaults when initialized", () => {
      const rAPI = new RiotAPI("1234");

      expect(rAPI.cache).toBeUndefined();
      expect(rAPI.riotRateLimiter).toBeTruthy();
      expect(rAPI.token).toEqual("1234");
      expect(rAPI.config).toEqual({ debug: false });
      expect(rAPI.ddragon).toBeInstanceOf(DDragon);
    });

    test("should initialize MemoryCache if config set to local cache", () => {
      const rAPI = new RiotAPI("1234", {
        cache: {
          cacheType: "local",
        },
      });

      expect(rAPI.cache).toBeTruthy();
      expect(MemoryCache).toHaveBeenCalled();
    });

    test("should initialize RedisCache if config set to ioredis cache", () => {
      const rAPI = new RiotAPI("1234", {
        cache: {
          cacheType: "ioredis",
          client: "redis://localhost:6379",
        },
      });

      expect(rAPI.cache).toBeTruthy();
      expect(RedisCache).toHaveBeenCalledWith("redis://localhost:6379");
    });
  });

  describe("request", () => {
    test("should call rrl.execute with URL & default options", async () => {
      const rAPI = new RiotAPI("1234");
      const mockExecute = rAPI.riotRateLimiter.execute as jest.Mock;
      mockExecute.mockResolvedValue({ name: "Demos Kratos" });

      await expect(
        rAPI.request(
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.SUMMONER.GET_BY_SUMMONER_NAME,
          { summonerName: "Demos" }
        )
      ).resolves.toEqual({ name: "Demos Kratos" });

      expect(mockExecute).toHaveBeenCalledWith(
        {
          url:
            "https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/Demos",
          options: {
            body: undefined,
            headers: { "X-Riot-Token": "1234" },
          },
        },
        {
          id: expect.any(String),
        }
      );
    });

    test("should call rrl.execute with URL with query params", async () => {
      const rAPI = new RiotAPI("1234");
      const mockExecute = rAPI.riotRateLimiter.execute as jest.Mock;

      await rAPI.request(
        PlatformId.EUW1,
        RiotAPITypes.METHOD_KEY.SUMMONER.GET_BY_SUMMONER_NAME,
        { summonerName: "Demos" },
        { id: "10", params: { name: "kratos" } }
      );

      expect(mockExecute).toHaveBeenCalledWith(
        {
          url:
            "https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/Demos?name=kratos",
          options: expect.anything(),
        },
        {
          id: "10",
        }
      );
    });

    test("should call rrl.execute with custom method & body", async () => {
      const rAPI = new RiotAPI("1234");
      const mockExecute = rAPI.riotRateLimiter.execute as jest.Mock;

      await rAPI.request(
        PlatformId.EUW1,
        RiotAPITypes.METHOD_KEY.SUMMONER.GET_BY_SUMMONER_NAME,
        { summonerName: "Demos" },
        { id: "10", body: { name: "kratos" }, method: "POST" }
      );

      expect(mockExecute).toHaveBeenCalledWith(
        {
          url:
            "https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/Demos",
          options: {
            body: JSON.stringify({ name: "kratos" }),
            method: "POST",
            headers: expect.anything(),
          },
        },
        {
          id: "10",
        }
      );
    });

    test("should call rrl.execute with custom headers", async () => {
      const rAPI = new RiotAPI("1234");
      const mockExecute = rAPI.riotRateLimiter.execute as jest.Mock;

      await rAPI.request(
        PlatformId.EUW1,
        RiotAPITypes.METHOD_KEY.SUMMONER.GET_BY_SUMMONER_NAME,
        { summonerName: "Demos" },
        {
          id: "10",
          body: { name: "kratos" },
          method: "POST",
          headers: { Authorization: "me" },
        }
      );

      expect(mockExecute).toHaveBeenCalledWith(
        {
          url:
            "https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/Demos",
          options: {
            body: JSON.stringify({ name: "kratos" }),
            method: "POST",
            headers: {
              Authorization: "me",
            },
          },
        },
        {
          id: "10",
        }
      );
    });

    test("should call rrl.execute with custom priority and expiration", async () => {
      const rAPI = new RiotAPI("1234");
      const mockExecute = rAPI.riotRateLimiter.execute as jest.Mock;

      await rAPI.request(
        PlatformId.EUW1,
        RiotAPITypes.METHOD_KEY.SUMMONER.GET_BY_SUMMONER_NAME,
        { summonerName: "Demos" },
        { id: "10", priority: 0, expiration: 10 }
      );

      expect(mockExecute).toHaveBeenCalledWith(expect.anything(), {
        id: "10",
        priority: 0,
        expiration: 10,
      });
    });

    test("should NOT call rrl.execute if value is present in the cache", async () => {
      const rAPI = new RiotAPI("1234", {
        cache: {
          cacheType: "local",
          ttls: {
            byMethod: {
              [RiotAPITypes.METHOD_KEY.SUMMONER.GET_BY_SUMMONER_NAME]: 10,
            },
          },
        },
      });
      const mockExecute = rAPI.riotRateLimiter.execute as jest.Mock;
      const mockCacheGet = (rAPI.cache?.get as jest.Mock) ?? jest.fn();
      mockCacheGet.mockResolvedValue({ name: "Demos Kratos" });

      await expect(
        rAPI.request(
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.SUMMONER.GET_BY_SUMMONER_NAME,
          { summonerName: "Demos" }
        )
      ).resolves.toEqual({ name: "Demos Kratos" });

      expect(mockExecute).not.toHaveBeenCalled();
      expect(mockCacheGet).toHaveBeenCalledWith(
        "https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/Demos"
      );
    });

    test("should set the value returned from rrl.execute into the cache", async () => {
      const rAPI = new RiotAPI("1234", {
        cache: {
          cacheType: "local",
          ttls: {
            byMethod: {
              [RiotAPITypes.METHOD_KEY.SUMMONER.GET_BY_SUMMONER_NAME]: 10,
            },
          },
        },
      });
      const mockExecute = rAPI.riotRateLimiter.execute as jest.Mock;
      const mockCacheGet = (rAPI.cache?.get as jest.Mock) ?? jest.fn();
      const mockCacheSet = (rAPI.cache?.set as jest.Mock) ?? jest.fn();
      mockExecute.mockResolvedValue({ name: "Demos Kratos" });
      mockCacheGet.mockResolvedValue(null);
      mockCacheSet.mockResolvedValue("OK");

      await rAPI.request(
        PlatformId.EUW1,
        RiotAPITypes.METHOD_KEY.SUMMONER.GET_BY_SUMMONER_NAME,
        { summonerName: "Demos" }
      );

      expect(mockCacheGet).toHaveBeenCalled();
      expect(mockCacheSet).toHaveBeenCalledWith(
        "https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/Demos",
        { name: "Demos Kratos" },
        10
      );
    });
  });

  describe("account", () => {
    test.each([
      [
        "getByPUUID",
        { region: PlatformId.EUROPE, puuid: "1" },
        [
          PlatformId.EUROPE,
          RiotAPITypes.METHOD_KEY.ACCOUNT.GET_BY_PUUID,
          { puuid: "1" },
          { id: "europe.account.getByPUUID.1", priority: 4 },
        ],
      ],
      [
        "getByRiotId",
        { region: PlatformId.EUROPE, gameName: "Demos Kratos", tagLine: "EUW" },
        [
          PlatformId.EUROPE,
          RiotAPITypes.METHOD_KEY.ACCOUNT.GET_BY_RIOT_ID,
          { gameName: "Demos Kratos", tagLine: "EUW" },
          { id: "europe.account.getByRiotId.Demos Kratos.EUW", priority: 4 },
        ],
      ],
      [
        "getActiveShardForPlayer",
        { region: PlatformId.EUROPE, game: "val", puuid: "1" },
        [
          PlatformId.EUROPE,
          RiotAPITypes.METHOD_KEY.ACCOUNT.GET_ACTIVE_SHARD_FOR_PLAYER,
          { game: "val", puuid: "1" },
          { id: "europe.account.getActiveShardForPlayer.val.1" },
        ],
      ],
    ])(
      "%s - calls request with correct params",
      async (name, input, params) => {
        const rAPI = new RiotAPI("1234");
        rAPI.request = jest.fn().mockResolvedValue(null);

        await getKeyValue(rAPI.account)(name as any)(input as any);
        expect(rAPI.request).toHaveBeenCalledWith(...params);
      }
    );
  });

  describe("championMastery", () => {
    test.each([
      [
        "getAllChampions",
        { region: PlatformId.EUW1, summonerId: "1" },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.CHAMPION_MASTERY.GET_ALL_CHAMPIONS,
          { summonerId: "1" },
          { id: "euw1.championMastery.getAllChampions.1" },
        ],
      ],
      [
        "getChampion",
        { region: PlatformId.EUW1, championId: 1, summonerId: "1" },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.CHAMPION_MASTERY.GET_CHAMPION_MASTERY,
          { championId: 1, summonerId: "1" },
          { id: "euw1.championMastery.getChampion.1.1" },
        ],
      ],
      [
        "getMasteryScore",
        { region: PlatformId.EUW1, summonerId: "1" },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.CHAMPION_MASTERY.GET_CHAMPION_MASTERY_SCORE,
          { summonerId: "1" },
          { id: "euw1.championMastery.getMasteryScore.1" },
        ],
      ],
    ])(
      "%s - calls request with correct params",
      async (name, input, params) => {
        const rAPI = new RiotAPI("1234");
        rAPI.request = jest.fn().mockResolvedValue(null);

        await getKeyValue(rAPI.championMastery)(name as any)(input as any);
        expect(rAPI.request).toHaveBeenCalledWith(...params);
      }
    );
  });

  describe("champion", () => {
    test.each([
      [
        "getRotations",
        { region: PlatformId.EUW1 },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.CHAMPION.GET_CHAMPION_ROTATIONS,
          {},
          { id: "euw1.champion.getRotations" },
        ],
      ],
    ])(
      "%s - calls request with correct params",
      async (name, input, params) => {
        const rAPI = new RiotAPI("1234");
        rAPI.request = jest.fn().mockResolvedValue(null);

        await getKeyValue(rAPI.champion)(name as any)(input as any);
        expect(rAPI.request).toHaveBeenCalledWith(...params);
      }
    );
  });

  describe("clash", () => {
    test.each([
      [
        "getPlayersBySummonerId",
        { region: PlatformId.EUW1, summonerId: "1" },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.CLASH.GET_PLAYERS_BY_SUMMONER,
          { summonerId: "1" },
          { id: "euw1.clash.getPlayersBySummonerId.1" },
        ],
      ],
      [
        "getTeamById",
        { region: PlatformId.EUW1, teamId: "1" },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.CLASH.GET_TEAM,
          { teamId: "1" },
          { id: "euw1.clash.getTeamById.1" },
        ],
      ],
      [
        "getTournaments",
        { region: PlatformId.EUW1 },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.CLASH.GET_TOURNAMENTS,
          {},
          { id: "euw1.clash.getTournaments" },
        ],
      ],
      [
        "getTournamentById",
        { region: PlatformId.EUW1, tournamentId: "1" },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.CLASH.GET_TOURNAMENT,
          { tournamentId: "1" },
          { id: "euw1.clash.getTournamentById.1" },
        ],
      ],
      [
        "getTournamentByTeamId",
        { region: PlatformId.EUW1, teamId: "1" },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.CLASH.GET_TOURNAMENT_TEAM,
          { teamId: "1" },
          { id: "euw1.clash.getTournamentByTeamId.1" },
        ],
      ],
    ])(
      "%s - calls request with correct params",
      async (name, input, params) => {
        const rAPI = new RiotAPI("1234");
        rAPI.request = jest.fn().mockResolvedValue(null);

        await getKeyValue(rAPI.clash)(name as any)(input as any);
        expect(rAPI.request).toHaveBeenCalledWith(...params);
      }
    );
  });

  describe("leagueExp", () => {
    test.each([
      [
        "getLeagueEntries",
        {
          region: PlatformId.EUW1,
          queue: RiotAPITypes.QUEUE.RANKED_SOLO_5x5,
          tier: RiotAPITypes.TIER.CHALLENGER,
          division: RiotAPITypes.DIVISION.I,
        },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.LEAGUE_EXP.GET_LEAGUE_ENTRIES,
          {
            queue: RiotAPITypes.QUEUE.RANKED_SOLO_5x5,
            tier: RiotAPITypes.TIER.CHALLENGER,
            division: RiotAPITypes.DIVISION.I,
          },
          {
            id: "euw1.leagueExp.getLeagueEntries.RANKED_SOLO_5x5.CHALLENGER.I",
          },
        ],
      ],
    ])(
      "%s - calls request with correct params",
      async (name, input, params) => {
        const rAPI = new RiotAPI("1234");
        rAPI.request = jest.fn().mockResolvedValue(null);

        await getKeyValue(rAPI.leagueExp)(name as any)(input as any);
        expect(rAPI.request).toHaveBeenCalledWith(...params);
      }
    );
  });

  describe("league", () => {
    test.each([
      [
        "getChallengerByQueue",
        {
          region: PlatformId.EUW1,
          queue: RiotAPITypes.QUEUE.RANKED_SOLO_5x5,
        },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.LEAGUE.GET_CHALLENGER_BY_QUEUE,
          {
            queue: RiotAPITypes.QUEUE.RANKED_SOLO_5x5,
          },
          {
            id: "euw1.league.getChallengerByQueue.RANKED_SOLO_5x5",
          },
        ],
      ],
      [
        "getEntriesBySummonerId",
        {
          region: PlatformId.EUW1,
          summonerId: "1",
        },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.LEAGUE.GET_ENTRIES_BY_SUMMONER,
          { summonerId: "1" },
          {
            id: "euw1.league.getEntriesBySummonerId.1",
          },
        ],
      ],
      [
        "getAllEntries",
        {
          region: PlatformId.EUW1,
          queue: RiotAPITypes.QUEUE.RANKED_SOLO_5x5,
          tier: RiotAPITypes.TIER.CHALLENGER,
          division: RiotAPITypes.DIVISION.I,
        },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.LEAGUE.GET_ALL_ENTRIES,
          {
            queue: RiotAPITypes.QUEUE.RANKED_SOLO_5x5,
            tier: RiotAPITypes.TIER.CHALLENGER,
            division: RiotAPITypes.DIVISION.I,
          },
          {
            id: "euw1.league.getAllEntries.RANKED_SOLO_5x5.CHALLENGER.I",
          },
        ],
      ],
      [
        "getGrandmasterByQueue",
        {
          region: PlatformId.EUW1,
          queue: RiotAPITypes.QUEUE.RANKED_SOLO_5x5,
        },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.LEAGUE.GET_GRANDMASTER_BY_QUEUE,
          {
            queue: RiotAPITypes.QUEUE.RANKED_SOLO_5x5,
          },
          {
            id: "euw1.league.getGrandmasterByQueue.RANKED_SOLO_5x5",
          },
        ],
      ],
      [
        "getById",
        {
          region: PlatformId.EUW1,
          leagueId: "1",
        },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.LEAGUE.GET_LEAGUE_BY_ID,
          {
            leagueId: "1",
          },
          {
            id: "euw1.league.getById.1",
          },
        ],
      ],
      [
        "getMasterByQueue",
        {
          region: PlatformId.EUW1,
          queue: RiotAPITypes.QUEUE.RANKED_SOLO_5x5,
        },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.LEAGUE.GET_MASTER_BY_QUEUE,
          {
            queue: RiotAPITypes.QUEUE.RANKED_SOLO_5x5,
          },
          {
            id: "euw1.league.getMasterByQueue.RANKED_SOLO_5x5",
          },
        ],
      ],
    ])(
      "%s - calls request with correct params",
      async (name, input, params) => {
        const rAPI = new RiotAPI("1234");
        rAPI.request = jest.fn().mockResolvedValue(null);

        await getKeyValue(rAPI.league)(name as any)(input as any);
        expect(rAPI.request).toHaveBeenCalledWith(...params);
      }
    );
  });

  describe("lorMatch", () => {
    test.each([
      [
        "getMatchIdsByPUUID",
        {
          region: PlatformId.EUROPE,
          puuid: "1234",
        },
        [
          PlatformId.EUROPE,
          RiotAPITypes.METHOD_KEY.LOR_MATCH.GET_MATCH_IDS_BY_PUUID,
          { puuid: "1234" },
          {
            id: "europe.lorMatch.getMatchIdsByPUUID.1234",
          },
        ],
      ],
      [
        "getById",
        {
          region: PlatformId.EUROPE,
          matchId: "1234",
        },
        [
          PlatformId.EUROPE,
          RiotAPITypes.METHOD_KEY.LOR_MATCH.GET_MATCH_BY_ID,
          { matchId: "1234" },
          {
            id: "europe.lorMatch.getById.1234",
          },
        ],
      ],
    ])(
      "%s - calls request with correct params",
      async (name, input, params) => {
        const rAPI = new RiotAPI("1234");
        rAPI.request = jest.fn().mockResolvedValue(null);

        await getKeyValue(rAPI.lorMatch)(name as any)(input as any);
        expect(rAPI.request).toHaveBeenCalledWith(...params);
      }
    );
  });

  describe("lorRanked", () => {
    test.each([
      [
        "getMasterTier",
        {
          region: PlatformId.EUROPE,
        },
        [
          PlatformId.EUROPE,
          RiotAPITypes.METHOD_KEY.LOR_RANKED.GET_MASTER_TIER,
          {},
          {
            id: "europe.lorRanked.getMasterTier",
          },
        ],
      ],
    ])(
      "%s - calls request with correct params",
      async (name, input, params) => {
        const rAPI = new RiotAPI("1234");
        rAPI.request = jest.fn().mockResolvedValue(null);

        await getKeyValue(rAPI.lorRanked)(name as any)(input as any);
        expect(rAPI.request).toHaveBeenCalledWith(...params);
      }
    );
  });

  describe("match", () => {
    test.each([
      [
        "getIdsByTournamentCode",
        {
          region: PlatformId.EUW1,
          tournamentCode: "11",
        },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.MATCH.GET_IDS_BY_TOURNAMENT_CODE,
          { tournamentCode: "11" },
          {
            id: "euw1.match.getIdsByTournamentCode.11",
          },
        ],
      ],
      [
        "getById",
        {
          region: PlatformId.EUW1,
          matchId: 1,
        },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.MATCH.GET_MATCH_BY_ID,
          { matchId: 1 },
          {
            id: "euw1.match.getById.1",
          },
        ],
      ],
      [
        "getByIdAndTournamentCode",
        {
          region: PlatformId.EUW1,
          matchId: 1,
          tournamentCode: "11",
        },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.MATCH.GET_MATCH_BY_ID_AND_TOURNAMENT_CODE,
          { matchId: 1, tournamentCode: "11" },
          {
            id: "euw1.match.getByIdAndTournamentCode.1.11",
          },
        ],
      ],
      [
        "getMatchlistByAccount",
        {
          region: PlatformId.EUW1,
          accountId: 1,
          params: { champion: 1 },
        },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.MATCH.GET_MATCHLIST_BY_ACCOUNT,
          { accountId: 1 },
          {
            id: "euw1.match.getMatchlistByAccount.1",
            params: { champion: 1 },
          },
        ],
      ],
      [
        "getTimelineById",
        {
          region: PlatformId.EUW1,
          matchId: 1,
        },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.MATCH.GET_TIMELINE_BY_MATCH_ID,
          { matchId: 1 },
          {
            id: "euw1.match.getTimelineById.1",
          },
        ],
      ],
    ])(
      "%s - calls request with correct params",
      async (name, input, params) => {
        const rAPI = new RiotAPI("1234");
        rAPI.request = jest.fn().mockResolvedValue(null);

        await getKeyValue(rAPI.match)(name as any)(input as any);
        expect(rAPI.request).toHaveBeenCalledWith(...params);
      }
    );
  });

  describe("match_v5", () => {
    test.each([
      [
        "getIdsbyPuuid",
        {
          cluster: PlatformId.EUROPE,
          puuid: "uuid",
        },
        [
          PlatformId.EUROPE,
          RiotAPITypes.METHOD_KEY.MATCH_V5.GET_IDS_BY_PUUID,
          { puuid: "uuid" },
          {
            id: `${PlatformId.EUROPE}.matchv5.getIdsByPuuid.uuid`,
          },
        ],
      ],
      [
        "getIdsbyPuuid",
        {
          cluster: PlatformId.EUROPE,
          puuid: "uuid",
          params: {
            queue: 1,
            type: RiotAPITypes.MatchV5.MatchType.Ranked,
            start: 0,
            count: 20,
          }
        },
        [
          PlatformId.EUROPE,
          RiotAPITypes.METHOD_KEY.MATCH_V5.GET_IDS_BY_PUUID,
          { puuid: "uuid" },
          {
            id: `${PlatformId.EUROPE}.matchv5.getIdsByPuuid.uuid`,
            params: {
              queue: 1,
              type: RiotAPITypes.MatchV5.MatchType.Ranked,
              start: 0,
              count: 20,
            }
          },
        ],
      ],
      [
        "getMatchById",
        {
          cluster: PlatformId.EUROPE,
          matchId: "123",
        },
        [
          PlatformId.EUROPE,
          RiotAPITypes.METHOD_KEY.MATCH_V5.GET_MATCH_BY_ID,
          { matchId: "123" },
          {
            id: `${PlatformId.EUROPE}.matchv5.getMatchById.123`,
          },
        ],
      ],
      [
        "getMatchTimelineById",
        {
          cluster: PlatformId.EUROPE,
          matchId: "123",
        },
        [
          PlatformId.EUROPE,
          RiotAPITypes.METHOD_KEY.MATCH_V5.GET_MATCH_TIMELINE_BY_ID,
          { matchId: "123" },
          {
            id: `${PlatformId.EUROPE}.matchv5.getMatchTimelineById.123`,
          },
        ],
      ],
    ])(
      "%s - calls request with correct params",
      async (name, input, params) => {
        const rAPI = new RiotAPI("1234");
        rAPI.request = jest.fn().mockResolvedValue(null);

        await getKeyValue(rAPI.matchV5)(name as any)(input as any);
        expect(rAPI.request).toHaveBeenCalledWith(...params);
      }
    );
  })

  describe("spectator", () => {
    test.each([
      [
        "getBySummonerId",
        {
          region: PlatformId.EUW1,
          summonerId: "1",
        },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.SPECTATOR.GET_GAME_BY_SUMMONER_ID,
          { summonerId: "1" },
          {
            id: "euw1.spectator.getBySummonerId.1",
          },
        ],
      ],
      [
        "getFeaturedGames",
        {
          region: PlatformId.EUW1,
        },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.SPECTATOR.GET_FEATURED_GAMES,
          {},
          {
            id: "euw1.spectator.getFeaturedGames",
          },
        ],
      ],
    ])(
      "%s - calls request with correct params",
      async (name, input, params) => {
        const rAPI = new RiotAPI("1234");
        rAPI.request = jest.fn().mockResolvedValue(null);

        await getKeyValue(rAPI.spectator)(name as any)(input as any);
        expect(rAPI.request).toHaveBeenCalledWith(...params);
      }
    );
  });

  describe("summoner", () => {
    test.each([
      [
        "getByAccountId",
        {
          region: PlatformId.EUW1,
          accountId: "1",
        },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.SUMMONER.GET_BY_ACCOUNT_ID,
          { accountId: "1" },
          {
            id: "euw1.summoner.getByAccountId.1",
          },
        ],
      ],
      [
        "getBySummonerName",
        {
          region: PlatformId.EUW1,
          summonerName: "Demos",
        },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.SUMMONER.GET_BY_SUMMONER_NAME,
          { summonerName: "Demos" },
          {
            id: "euw1.summoner.getBySummonerName.Demos",
          },
        ],
      ],
      [
        "getByPUUID",
        {
          region: PlatformId.EUW1,
          puuid: "1",
        },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.SUMMONER.GET_BY_PUUID,
          { puuid: "1" },
          {
            id: "euw1.summoner.getByPUUID.1",
          },
        ],
      ],
      [
        "getBySummonerId",
        {
          region: PlatformId.EUW1,
          summonerId: "1",
        },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.SUMMONER.GET_BY_SUMMONER_ID,
          { summonerId: "1" },
          {
            id: "euw1.summoner.getBySummonerId.1",
          },
        ],
      ],
      [
        "getByAccessToken",
        {
          region: PlatformId.EUW1,
          accessToken: "12222",
        },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.SUMMONER.GET_BY_ACCESS_TOKEN,
          {},
          {
            id: "euw1.summoner.getByAccessToken",
            headers: {
              Authorization: "Bearer 12222",
            },
          },
        ],
      ],
    ])(
      "%s - calls request with correct params",
      async (name, input, params) => {
        const rAPI = new RiotAPI("1234");
        rAPI.request = jest.fn().mockResolvedValue(null);

        await getKeyValue(rAPI.summoner)(name as any)(input as any);
        expect(rAPI.request).toHaveBeenCalledWith(...params);
      }
    );
  });

  describe("tftLeague", () => {
    test.each([
      [
        "getChallenger",
        {
          region: PlatformId.EUW1,
        },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.TFT_LEAGUE.GET_CHALLENGER,
          {},
          {
            id: "euw1.tftLeague.getChallenger",
          },
        ],
      ],
      [
        "getEntriesBySummonerId",
        {
          region: PlatformId.EUW1,
          summonerId: "1",
        },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.TFT_LEAGUE.GET_ENTRIES_BY_SUMMONER,
          { summonerId: "1" },
          {
            id: "euw1.tftLeague.getEntriesBySummonerId.1",
          },
        ],
      ],
      [
        "getAllEntries",
        {
          region: PlatformId.EUW1,
          tier: RiotAPITypes.TIER.CHALLENGER,
          division: RiotAPITypes.DIVISION.I,
          params: { page: 1 },
        },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.TFT_LEAGUE.GET_ALL_ENTRIES,
          {
            tier: RiotAPITypes.TIER.CHALLENGER,
            division: RiotAPITypes.DIVISION.I,
          },
          {
            id: "euw1.tftLeague.getAllEntries.CHALLENGER.I",
            params: { page: 1 },
          },
        ],
      ],
      [
        "getGrandmaster",
        {
          region: PlatformId.EUW1,
        },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.TFT_LEAGUE.GET_GRANDMASTER,
          {},
          {
            id: "euw1.tftLeague.getGrandmaster",
          },
        ],
      ],
      [
        "getLeagueById",
        {
          region: PlatformId.EUW1,
          leagueId: "1",
        },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.TFT_LEAGUE.GET_LEAGUE_BY_ID,
          {
            leagueId: "1",
          },
          {
            id: "euw1.tftLeague.getLeagueById.1",
          },
        ],
      ],
      [
        "getMaster",
        {
          region: PlatformId.EUW1,
        },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.TFT_LEAGUE.GET_MASTER,
          {},
          {
            id: "euw1.tftLeague.getMaster",
          },
        ],
      ],
    ])(
      "%s - calls request with correct params",
      async (name, input, params) => {
        const rAPI = new RiotAPI("1234");
        rAPI.request = jest.fn().mockResolvedValue(null);

        await getKeyValue(rAPI.tftLeague)(name as any)(input as any);
        expect(rAPI.request).toHaveBeenCalledWith(...params);
      }
    );
  });

  describe("tftMatch", () => {
    test.each([
      [
        "getMatchIdsByPUUID",
        {
          region: PlatformId.EUROPE,
          puuid: "1",
          params: { count: 10 },
        },
        [
          PlatformId.EUROPE,
          RiotAPITypes.METHOD_KEY.TFT_MATCH.GET_MATCH_IDS_BY_PUUID,
          { puuid: "1" },
          {
            id: "europe.tftMatch.getMatchIdsByPUUID.1",
            params: { count: 10 },
          },
        ],
      ],
      [
        "getById",
        {
          region: PlatformId.EUROPE,
          matchId: "1",
        },
        [
          PlatformId.EUROPE,
          RiotAPITypes.METHOD_KEY.TFT_MATCH.GET_MATCH_BY_ID,
          { matchId: "1" },
          {
            id: "europe.tftMatch.getById.1",
          },
        ],
      ],
    ])(
      "%s - calls request with correct params",
      async (name, input, params) => {
        const rAPI = new RiotAPI("1234");
        rAPI.request = jest.fn().mockResolvedValue(null);

        await getKeyValue(rAPI.tftMatch)(name as any)(input as any);
        expect(rAPI.request).toHaveBeenCalledWith(...params);
      }
    );
  });

  describe("tftSummoner", () => {
    test.each([
      [
        "getByAccountId",
        {
          region: PlatformId.EUW1,
          accountId: "1",
        },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.TFT_SUMMONER.GET_BY_ACCOUNT_ID,
          { accountId: "1" },
          {
            id: "euw1.tftSummoner.getByAccountId.1",
          },
        ],
      ],
      [
        "getBySummonerName",
        {
          region: PlatformId.EUW1,
          summonerName: "Demos",
        },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.TFT_SUMMONER.GET_BY_SUMMONER_NAME,
          { summonerName: "Demos" },
          {
            id: "euw1.tftSummoner.getBySummonerName.Demos",
          },
        ],
      ],
      [
        "getByPUUID",
        {
          region: PlatformId.EUW1,
          puuid: "1",
        },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.TFT_SUMMONER.GET_BY_PUUID,
          { puuid: "1" },
          {
            id: "euw1.tftSummoner.getByPUUID.1",
          },
        ],
      ],
      [
        "getBySummonerId",
        {
          region: PlatformId.EUW1,
          summonerId: "1",
        },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.TFT_SUMMONER.GET_BY_SUMMONER_ID,
          { summonerId: "1" },
          {
            id: "euw1.tftSummoner.getBySummonerId.1",
          },
        ],
      ],
    ])(
      "%s - calls request with correct params",
      async (name, input, params) => {
        const rAPI = new RiotAPI("1234");
        rAPI.request = jest.fn().mockResolvedValue(null);

        await getKeyValue(rAPI.tftSummoner)(name as any)(input as any);
        expect(rAPI.request).toHaveBeenCalledWith(...params);
      }
    );
  });

  describe("thirdPartyCode", () => {
    test.each([
      [
        "getBySummonerId",
        {
          region: PlatformId.EUW1,
          summonerId: "1",
        },
        [
          PlatformId.EUW1,
          RiotAPITypes.METHOD_KEY.THIRD_PARTY_CODE.GET_BY_SUMMONER_ID,
          { summonerId: "1" },
          {
            id: "euw1.thirdPartyCode.getBySummonerId.1",
          },
        ],
      ],
    ])(
      "%s - calls request with correct params",
      async (name, input, params) => {
        const rAPI = new RiotAPI("1234");
        rAPI.request = jest.fn().mockResolvedValue(null);

        await getKeyValue(rAPI.thirdPartyCode)(name as any)(input as any);
        expect(rAPI.request).toHaveBeenCalledWith(...params);
      }
    );
  });

  describe("tournamentStub", () => {
    test.each([
      [
        "createCodes",
        {
          params: { tournamentId: 22, count: 1 },
          body: { mapType: RiotAPITypes.Tournament.MAPTYPE.SUMMONERS_RIFT },
        },
        [
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT_STUB.POST_CREATE_CODES,
          {},
          {
            id: "americas.tournamentStub.createCodes.22",
            params: { tournamentId: 22, count: 1 },
            method: "POST",
            body: { mapType: RiotAPITypes.Tournament.MAPTYPE.SUMMONERS_RIFT },
          },
        ],
      ],
      [
        "getLobbyEventsByTournamentCode",
        {
          tournamentCode: "1",
        },
        [
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT_STUB
            .GET_LOBBY_EVENTS_BY_TOURNAMENT_CODE,
          { tournamentCode: "1" },
          {
            id: "americas.tournamentStub.getLobbyEventsByTournamentCode.1",
          },
        ],
      ],
      [
        "createProvider",
        {
          body: { region: PlatformId.EUW1 },
        },
        [
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT_STUB.POST_CREATE_PROVIDER,
          {},
          {
            id: "americas.tournamentStub.createProvider",
            method: "POST",
            body: { region: PlatformId.EUW1 },
          },
        ],
      ],
      [
        "createTournament",
        {
          body: { name: "test" },
        },
        [
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT_STUB.POST_CREATE_TOURNAMENT,
          {},
          {
            id: "americas.tournamentStub.createTournament",
            method: "POST",
            body: { name: "test" },
          },
        ],
      ],
    ])(
      "%s - calls request with correct params",
      async (name, input, params) => {
        const rAPI = new RiotAPI("1234");
        rAPI.request = jest.fn().mockResolvedValue(null);

        await getKeyValue(rAPI.tournamentStub)(name as any)(input as any);
        expect(rAPI.request).toHaveBeenCalledWith(...params);
      }
    );
  });

  describe("tournament", () => {
    test.each([
      [
        "createCodes",
        {
          params: { tournamentId: 22, count: 1 },
          body: { mapType: RiotAPITypes.Tournament.MAPTYPE.SUMMONERS_RIFT },
        },
        [
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT.POST_CREATE_CODES,
          {},
          {
            id: "americas.tournament.createCodes.22",
            params: { tournamentId: 22, count: 1 },
            method: "POST",
            body: { mapType: RiotAPITypes.Tournament.MAPTYPE.SUMMONERS_RIFT },
            priority: 0,
          },
        ],
      ],
      [
        "getByTournamentCode",
        {
          tournamentCode: "1",
        },
        [
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT.GET_TOURNAMENT_BY_CODE,
          { tournamentCode: "1" },
          {
            id: "americas.tournament.getByTournamentCode.1",
            priority: 0,
          },
        ],
      ],
      [
        "updateByTournamentCode",
        {
          tournamentCode: "1",
          body: { mapType: RiotAPITypes.Tournament.MAPTYPE.SUMMONERS_RIFT },
        },
        [
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT.GET_TOURNAMENT_BY_CODE,
          { tournamentCode: "1" },
          {
            id: "americas.tournament.updateByTournamentCode.1",
            method: "POST",
            body: { mapType: RiotAPITypes.Tournament.MAPTYPE.SUMMONERS_RIFT },
            priority: 0,
          },
        ],
      ],
      [
        "getLobbyEventsByTournamentCode",
        {
          tournamentCode: "1",
        },
        [
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT
            .GET_LOBBY_EVENTS_BY_TOURNAMENT_CODE,
          { tournamentCode: "1" },
          {
            id: "americas.tournament.getLobbyEventsByTournamentCode.1",
            priority: 0,
          },
        ],
      ],
      [
        "createProvider",
        {
          body: { region: PlatformId.EUW1 },
        },
        [
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT.POST_CREATE_PROVIDER,
          {},
          {
            id: "americas.tournament.createProvider",
            method: "POST",
            body: { region: PlatformId.EUW1 },
            priority: 0,
          },
        ],
      ],
      [
        "createTournament",
        {
          body: { name: "test" },
        },
        [
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT.POST_CREATE_TOURNAMENT,
          {},
          {
            id: "americas.tournament.createTournament",
            method: "POST",
            body: { name: "test" },
            priority: 0,
          },
        ],
      ],
    ])(
      "%s - calls request with correct params",
      async (name, input, params) => {
        const rAPI = new RiotAPI("1234");
        rAPI.request = jest.fn().mockResolvedValue(null);

        await getKeyValue(rAPI.tournament)(name as any)(input as any);
        expect(rAPI.request).toHaveBeenCalledWith(...params);
      }
    );
  });

  describe("valContent", () => {
    test.each([
      [
        "getContent",
        {
          region: PlatformId.EU,
          params: { locale: "gb-en" },
        },
        [
          PlatformId.EU,
          RiotAPITypes.METHOD_KEY.VAL_CONTENT.GET_CONTENT,
          {},
          {
            id: "eu.valContent.getContent",
            params: { locale: "gb-en" },
          },
        ],
      ],
    ])(
      "%s - calls request with correct params",
      async (name, input, params) => {
        const rAPI = new RiotAPI("1234");
        rAPI.request = jest.fn().mockResolvedValue(null);

        await getKeyValue(rAPI.valContent)(name as any)(input as any);
        expect(rAPI.request).toHaveBeenCalledWith(...params);
      }
    );
  });

  describe("valMatch", () => {
    test.each([
      [
        "getById",
        {
          region: PlatformId.EU,
          matchId: "1",
        },
        [
          PlatformId.EU,
          RiotAPITypes.METHOD_KEY.VAL_MATCH.GET_MATCH_BY_ID,
          { matchId: "1" },
          {
            id: "eu.valMatch.getById.1",
          },
        ],
      ],
      [
        "getMatchlistByPUUID",
        {
          region: PlatformId.EU,
          puuid: "1",
        },
        [
          PlatformId.EU,
          RiotAPITypes.METHOD_KEY.VAL_MATCH.GET_MATCHLIST_BY_PUUID,
          { puuid: "1" },
          {
            id: "eu.valMatch.getMatchlistByPUUID.1",
          },
        ],
      ],
      [
        "getRecentMatchesByQueue",
        {
          region: PlatformId.EU,
          queue: RiotAPITypes.VAL_QUEUE.COMPETITIVE,
        },
        [
          PlatformId.EU,
          RiotAPITypes.METHOD_KEY.VAL_MATCH.GET_RECENT_MATCHES_BY_QUEUE,
          { queue: RiotAPITypes.VAL_QUEUE.COMPETITIVE },
          {
            id: "eu.valMatch.getRecentMatchesByQueue.competitive",
          },
        ],
      ],
    ])(
      "%s - calls request with correct params",
      async (name, input, params) => {
        const rAPI = new RiotAPI("1234");
        rAPI.request = jest.fn().mockResolvedValue(null);

        await getKeyValue(rAPI.valMatch)(name as any)(input as any);
        expect(rAPI.request).toHaveBeenCalledWith(...params);
      }
    );
  });
});
