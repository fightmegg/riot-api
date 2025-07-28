import {
  HOST,
  METHODS,
  PlatformId,
  RiotRateLimiter,
} from "@fightmegg/riot-rate-limiter";
import Bottleneck from "bottleneck";
import debug from "debug";
import { RedisOptions } from "ioredis";
import { compile } from "path-to-regexp";
import qs from "querystring";
import { Leaves, RiotAPITypes } from "./@types";
import { MemoryCache, RedisCache } from "./cache";
import { DDragon } from "./ddragon";
import { regionToCluster } from "./utils";

const debugCache = debug("riotapi:cache");

const createHost = compile(HOST, { encode: encodeURIComponent });

const getPath = (key: Leaves<METHODS>): string => {
  let path: METHODS | METHODS[keyof METHODS] | string = METHODS;
  const keys = key.split(".");

  for (const subKey of keys) {
    if (typeof path === "string") break;
    // @ts-expect-error typing for path[subkey] is hard
    path = path[subKey];
  }

  if (typeof path !== "string")
    throw new Error(`Incorrect path: ${key} results in ${path}`);

  return path;
};

export { DDragon, PlatformId, RiotAPITypes, regionToCluster };

export class RiotAPI {
  readonly cache?: MemoryCache | RedisCache;

  readonly riotRateLimiter: RiotRateLimiter;

  readonly token: string;

  readonly config: RiotAPITypes.Config = {
    debug: false,
  };

  ddragon: DDragon;

  constructor(token: string, config: RiotAPITypes.Config = {}) {
    if (!token) throw new Error("token is missing");

    this.token = token;
    this.config = { ...this.config, ...config };

    this.riotRateLimiter = new RiotRateLimiter({
      concurrency: 10,
      datastore: this.config.cache?.cacheType || "local",
      redis: this.config.cache?.client as Bottleneck.RedisConnectionOptions,
    });
    this.ddragon = new DDragon();

    if (this.config.cache?.cacheType === "local")
      this.cache = new MemoryCache();
    else if (this.config.cache?.cacheType === "ioredis")
      this.cache = new RedisCache(this.config.cache?.client as RedisOptions);
  }

  private getHeaders(headers?: { [key: string]: string }) {
    return headers || { "X-Riot-Token": this.token };
  }

  private getOptions({
    body,
    method,
    headers,
  }: {
    body?: object;
    method?: string;
    headers?: { [key: string]: string };
  } = {}) {
    return {
      headers: this.getHeaders(headers),
      body: body ? JSON.stringify(body) : undefined,
      method,
    };
  }

  private getJobOptions(
    {
      id,
      priority,
      expiration,
    }: {
      id: string;
      priority?: number;
      expiration?: number;
    } = { id: new Date().toString() }
  ) {
    return { id, priority, expiration };
  }

  private async checkCache<T>(key: string, url: string): Promise<T | null> {
    if (this.cache && this.config.cache?.ttls?.byMethod[key]) {
      const cacheValue = (await this.cache.get(url)) as T | null;
      if (cacheValue) debugCache("Cache Hit", key, url);
      return cacheValue;
    }
    return null;
  }

  private async setCache(
    key: string,
    url: string,
    data: object
  ): Promise<void> {
    if (this.cache && this.config.cache?.ttls?.byMethod[key]) {
      debugCache("Setting", key, url, this.config.cache.ttls.byMethod[key]);
      await this.cache.set(url, data, this.config.cache.ttls.byMethod[key]);
    }
  }

  async request<T>(
    platformId: PlatformId,
    methodKey: Leaves<METHODS>,
    pathData: { [key: string]: string | number },
    options?: RiotAPITypes.RequestOptions
  ): Promise<T> {
    const path = getPath(methodKey);
    const createPath = compile(path, { encode: encodeURIComponent });

    let url = `https://${createHost({ platformId })}${createPath(pathData)}`;
    if (options?.params) url += `?${qs.encode(options.params)}`;

    const cacheValue = await this.checkCache<T>(methodKey, url);
    if (cacheValue) return cacheValue as T;

    const resp = await this.riotRateLimiter.execute(
      { url, options: this.getOptions(options) },
      this.getJobOptions(options)
    );

    await this.setCache(methodKey, url, resp);
    return resp;
  }

  get account() {
    return {
      getByPUUID: ({
        region,
        puuid,
      }: {
        region: Exclude<RiotAPITypes.Cluster, PlatformId.SEA>;
        puuid: string;
      }): Promise<RiotAPITypes.Account.AccountDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.ACCOUNT.GET_BY_PUUID,
          { puuid },
          { id: `${region}.account.getByPUUID.${puuid}`, priority: 4 }
        ),
      getByRiotId: ({
        region,
        gameName,
        tagLine,
      }: {
        region: Exclude<RiotAPITypes.Cluster, PlatformId.SEA>;
        gameName: string;
        tagLine: string;
      }): Promise<RiotAPITypes.Account.AccountDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.ACCOUNT.GET_BY_RIOT_ID,
          { gameName, tagLine },
          {
            id: `${region}.account.getByRiotId.${gameName}.${tagLine}`,
            priority: 4,
          }
        ),
      getByAccessToken: ({
        region,
        accessToken,
      }: {
        region: Exclude<RiotAPITypes.Cluster, PlatformId.SEA>;
        accessToken: string;
      }): Promise<RiotAPITypes.Account.AccountDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.ACCOUNT.GET_BY_ACCESS_TOKEN,
          {},
          {
            id: `${region}.account.getByAccessToken`,
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        ),
      getActiveShardForPlayer: ({
        region,
        game,
        puuid,
      }: {
        region: Exclude<RiotAPITypes.Cluster, PlatformId.SEA>;
        game: "val" | "lor";
        puuid: string;
      }): Promise<RiotAPITypes.Account.ActiveShardDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.ACCOUNT.GET_ACTIVE_SHARD_FOR_PLAYER,
          { game, puuid },
          { id: `${region}.account.getActiveShardForPlayer.${game}.${puuid}` }
        ),
    };
  }

  get championMastery() {
    return {
      getAllChampions: ({
        region,
        summonerId,
      }: {
        region: RiotAPITypes.LoLRegion;
        summonerId: string;
      }): Promise<RiotAPITypes.ChampionMastery.ChampionMasteryDTO[]> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.CHAMPION_MASTERY.GET_ALL_CHAMPIONS,
          { summonerId },
          { id: `${region}.championMastery.getAllChampions.${summonerId}` }
        ),
      getChampion: ({
        region,
        championId,
        summonerId,
      }: {
        region: RiotAPITypes.LoLRegion;
        championId: number;
        summonerId: string;
      }): Promise<RiotAPITypes.ChampionMastery.ChampionMasteryDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.CHAMPION_MASTERY.GET_CHAMPION_MASTERY,
          { championId, summonerId },
          {
            id: `${region}.championMastery.getChampion.${championId}.${summonerId}`,
          }
        ),
      getTopChampions: ({
        region,
        summonerId,
        params,
      }: {
        region: RiotAPITypes.LoLRegion;
        summonerId: string;
        params?: {
          count?: number;
        };
      }): Promise<RiotAPITypes.ChampionMastery.ChampionMasteryDTO[]> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.CHAMPION_MASTERY.GET_TOP_CHAMPIONS,
          { summonerId },
          {
            id: `${region}.championMastery.getTopChampions.${summonerId}`,
            params,
          }
        ),
      getMasteryScore: ({
        region,
        summonerId,
      }: {
        region: RiotAPITypes.LoLRegion;
        summonerId: string;
      }): Promise<number> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.CHAMPION_MASTERY.GET_CHAMPION_MASTERY_SCORE,
          { summonerId },
          { id: `${region}.championMastery.getMasteryScore.${summonerId}` }
        ),
    };
  }

  get champion() {
    return {
      getRotations: ({
        region,
      }: {
        region: RiotAPITypes.LoLRegion;
      }): Promise<RiotAPITypes.Champion.ChampionInfoDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.CHAMPION.GET_CHAMPION_ROTATIONS,
          {},
          { id: `${region}.champion.getRotations` }
        ),
    };
  }

  get clash() {
    return {
      getPlayersBySummonerId: ({
        region,
        summonerId,
      }: {
        region: RiotAPITypes.LoLRegion;
        summonerId: string;
      }): Promise<RiotAPITypes.Clash.PlayerDTO[]> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.CLASH.GET_PLAYERS_BY_SUMMONER,
          { summonerId },
          { id: `${region}.clash.getPlayersBySummonerId.${summonerId}` }
        ),
      getTeamById: ({
        region,
        teamId,
      }: {
        region: RiotAPITypes.LoLRegion;
        teamId: string;
      }): Promise<RiotAPITypes.Clash.TeamDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.CLASH.GET_TEAM,
          { teamId },
          { id: `${region}.clash.getTeamById.${teamId}` }
        ),
      getTournaments: ({
        region,
      }: {
        region: RiotAPITypes.LoLRegion;
      }): Promise<RiotAPITypes.Clash.TournamentDTO[]> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.CLASH.GET_TOURNAMENTS,
          {},
          { id: `${region}.clash.getTournaments` }
        ),
      getTournamentById: ({
        region,
        tournamentId,
      }: {
        region: RiotAPITypes.LoLRegion;
        tournamentId: string;
      }): Promise<RiotAPITypes.Clash.TournamentDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.CLASH.GET_TOURNAMENT,
          { tournamentId },
          { id: `${region}.clash.getTournamentById.${tournamentId}` }
        ),
      getTournamentByTeamId: ({
        region,
        teamId,
      }: {
        region: RiotAPITypes.LoLRegion;
        teamId: string;
      }): Promise<RiotAPITypes.Clash.TeamDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.CLASH.GET_TOURNAMENT_TEAM,
          { teamId },
          { id: `${region}.clash.getTournamentByTeamId.${teamId}` }
        ),
    };
  }

  get leagueExp() {
    return {
      getLeagueEntries: ({
        region,
        queue,
        tier,
        division,
      }: {
        region: RiotAPITypes.LoLRegion;
        queue: RiotAPITypes.QUEUE;
        tier: RiotAPITypes.TIER;
        division: RiotAPITypes.DIVISION;
      }): Promise<RiotAPITypes.League.LeagueEntryDTO[]> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.LEAGUE_EXP.GET_LEAGUE_ENTRIES,
          { queue, tier, division },
          {
            id: `${region}.leagueExp.getLeagueEntries.${queue}.${tier}.${division}`,
          }
        ),
    };
  }

  get league() {
    return {
      getChallengerByQueue: ({
        region,
        queue,
      }: {
        region: RiotAPITypes.LoLRegion;
        queue: RiotAPITypes.QUEUE;
      }): Promise<RiotAPITypes.League.LeagueListDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.LEAGUE.GET_CHALLENGER_BY_QUEUE,
          { queue },
          {
            id: `${region}.league.getChallengerByQueue.${queue}`,
          }
        ),
      getEntriesByPUUID: ({
        region,
        puuid,
      }: {
        region: RiotAPITypes.LoLRegion;
        puuid: string;
      }): Promise<RiotAPITypes.League.LeagueEntryDTO[]> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.LEAGUE.GET_ENTRIES_BY_PUUID,
          { puuid },
          {
            id: `${region}.league.getEntriesByPUUID.${puuid}`,
          }
        ),
      getAllEntries: ({
        region,
        queue,
        tier,
        division,
      }: {
        region: RiotAPITypes.LoLRegion;
        queue: RiotAPITypes.QUEUE;
        tier: RiotAPITypes.TIER;
        division: RiotAPITypes.DIVISION;
      }): Promise<RiotAPITypes.League.LeagueEntryDTO[]> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.LEAGUE.GET_ALL_ENTRIES,
          { queue, tier, division },
          {
            id: `${region}.league.getAllEntries.${queue}.${tier}.${division}`,
          }
        ),
      getGrandmasterByQueue: ({
        region,
        queue,
      }: {
        region: RiotAPITypes.LoLRegion;
        queue: RiotAPITypes.QUEUE;
      }): Promise<RiotAPITypes.League.LeagueListDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.LEAGUE.GET_GRANDMASTER_BY_QUEUE,
          { queue },
          {
            id: `${region}.league.getGrandmasterByQueue.${queue}`,
          }
        ),
      getById: ({
        region,
        leagueId,
      }: {
        region: RiotAPITypes.LoLRegion;
        leagueId: string;
      }): Promise<RiotAPITypes.League.LeagueListDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.LEAGUE.GET_LEAGUE_BY_ID,
          { leagueId },
          {
            id: `${region}.league.getById.${leagueId}`,
          }
        ),
      getMasterByQueue: ({
        region,
        queue,
      }: {
        region: RiotAPITypes.LoLRegion;
        queue: RiotAPITypes.QUEUE;
      }): Promise<RiotAPITypes.League.LeagueListDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.LEAGUE.GET_MASTER_BY_QUEUE,
          { queue },
          {
            id: `${region}.league.getMasterByQueue.${queue}`,
          }
        ),
    };
  }

  get lolChallenges() {
    return {
      getConfig: ({
        region,
      }: {
        region: RiotAPITypes.LoLRegion;
      }): Promise<RiotAPITypes.LolChallenges.ChallengeConfigInfoDTO[]> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.LOL_CHALLENGES.GET_CONFIG,
          {},
          { id: `${region}.lolChallenges.getConfig` }
        ),
      getPercentiles: ({
        region,
      }: {
        region: RiotAPITypes.LoLRegion;
      }): Promise<RiotAPITypes.LolChallenges.ChallengePercentilesMap> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.LOL_CHALLENGES.GET_PERCENTILES,
          {},
          { id: `${region}.lolChallenges.getPercentiles` }
        ),
      getConfigById: ({
        region,
        challengeId,
      }: {
        region: RiotAPITypes.LoLRegion;
        challengeId: number;
      }): Promise<RiotAPITypes.LolChallenges.ChallengeConfigInfoDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.LOL_CHALLENGES.GET_CONFIG_BY_ID,
          { challengeId },
          { id: `${region}.lolChallenges.getConfigById.${challengeId}` }
        ),
      getLeaderboardById: ({
        region,
        challengeId,
        params,
      }: {
        region: RiotAPITypes.LoLRegion;
        challengeId: number;
        params?: {
          level?: number;
        };
      }): Promise<RiotAPITypes.LolChallenges.ApexPlayerInfoDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.LOL_CHALLENGES.GET_LEADERBOARD_BY_ID,
          { challengeId },
          {
            id: `${region}.lolChallenges.getLeaderboardById.${challengeId}`,
            params,
          }
        ),
      getPercentilesById: ({
        region,
        challengeId,
      }: {
        region: RiotAPITypes.LoLRegion;
        challengeId: number;
      }): Promise<RiotAPITypes.LolChallenges.ChallengePercentiles> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.LOL_CHALLENGES.GET_PERCENTILES_BY_ID,
          { challengeId },
          { id: `${region}.lolChallenges.getPercentilesById.${challengeId}` }
        ),
      getPlayerDataByPUUID: ({
        region,
        puuid,
      }: {
        region: RiotAPITypes.LoLRegion;
        puuid: string;
      }): Promise<RiotAPITypes.LolChallenges.PlayerInfoDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.LOL_CHALLENGES.GET_PLAYER_DATA_BY_PUUID,
          { puuid },
          { id: `${region}.lolChallenges.getPlayerDataByPUUID.${puuid}` }
        ),
    };
  }

  get lorDeck() {
    return {
      getDecksForPlayer: ({
        region,
        accessToken,
      }: {
        region: Exclude<
          RiotAPITypes.LORCluster,
          PlatformId.ASIA | PlatformId.APAC
        >;
        accessToken: string;
      }): Promise<RiotAPITypes.LorDeck.DeckDTO[]> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.LOR_DECK.GET_DECKS_FOR_PLAYER,
          {},
          {
            id: `${region}.lorDeck.getDecksForPlayer`,
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        ),
      createDeck: ({
        region,
        accessToken,
        body,
      }: {
        region: Exclude<RiotAPITypes.LORCluster, PlatformId.ASIA>;
        accessToken: string;
        body: RiotAPITypes.LorDeck.NewDeckDTO;
      }): Promise<string> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.LOR_DECK.POST_CREATE_DECK_FOR_PLAYER,
          {},
          {
            id: `${region}.lorDeck.createDeck`,
            body,
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        ),
    };
  }

  get lorInventory() {
    return {
      getCardsOwnedByPlayer: ({
        region,
        accessToken,
      }: {
        region: Exclude<
          RiotAPITypes.LORCluster,
          PlatformId.ASIA | PlatformId.APAC
        >;
        accessToken: string;
      }): Promise<RiotAPITypes.LorInventory.CardDTO[]> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.LOR_INVENTORY.GET_CARDS_OWNED_BY_PLAYER,
          {},
          {
            id: `${region}.lorInventory.getCardsOwnedByPlayer`,
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        ),
    };
  }

  get lorMatch() {
    return {
      getMatchIdsByPUUID: ({
        region,
        puuid,
      }: {
        region: Exclude<RiotAPITypes.LORCluster, PlatformId.ASIA>;
        puuid: string;
      }): Promise<string[]> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.LOR_MATCH.GET_MATCH_IDS_BY_PUUID,
          { puuid },
          { id: `${region}.lorMatch.getMatchIdsByPUUID.${puuid}` }
        ),
      getById: ({
        region,
        matchId,
      }: {
        region: Exclude<RiotAPITypes.LORCluster, PlatformId.ASIA>;
        matchId: string;
      }): Promise<RiotAPITypes.LorMatch.MatchDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.LOR_MATCH.GET_MATCH_BY_ID,
          { matchId },
          { id: `${region}.lorMatch.getById.${matchId}` }
        ),
    };
  }

  get lorRanked() {
    return {
      getMasterTier: ({
        region,
      }: {
        region: Exclude<
          RiotAPITypes.LORCluster,
          PlatformId.ASIA | PlatformId.APAC
        >;
      }): Promise<RiotAPITypes.LorRanked.LeaderboardDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.LOR_RANKED.GET_MASTER_TIER,
          {},
          { id: `${region}.lorRanked.getMasterTier` }
        ),
    };
  }

  get matchV5() {
    return {
      getIdsByPuuid: ({
        cluster,
        puuid,
        params,
      }: {
        cluster: Exclude<RiotAPITypes.Cluster, PlatformId.ESPORTS>;
        puuid: string;
        params?: {
          queue?: number;
          type?: RiotAPITypes.MatchV5.MatchType;
          start?: number;
          count?: number;
          startTime?: number;
          endTime?: number;
        };
      }): Promise<string[]> =>
        this.request(
          cluster,
          RiotAPITypes.METHOD_KEY.MATCH_V5.GET_IDS_BY_PUUID,
          { puuid },
          {
            id: `${cluster}.matchv5.getIdsByPuuid.${puuid}`,
            params,
          }
        ),
      getMatchById: ({
        cluster,
        matchId,
      }: {
        cluster: Exclude<RiotAPITypes.Cluster, PlatformId.ESPORTS>;
        matchId: string;
      }): Promise<RiotAPITypes.MatchV5.MatchDTO> =>
        this.request(
          cluster,
          RiotAPITypes.METHOD_KEY.MATCH_V5.GET_MATCH_BY_ID,
          { matchId },
          {
            id: `${cluster}.matchv5.getMatchById.${matchId}`,
          }
        ),
      getMatchTimelineById: ({
        cluster,
        matchId,
      }: {
        cluster: Exclude<RiotAPITypes.Cluster, PlatformId.ESPORTS>;
        matchId: string;
      }): Promise<RiotAPITypes.MatchV5.MatchTimelineDTO> =>
        this.request(
          cluster,
          RiotAPITypes.METHOD_KEY.MATCH_V5.GET_MATCH_TIMELINE_BY_ID,
          { matchId },
          {
            id: `${cluster}.matchv5.getMatchTimelineById.${matchId}`,
          }
        ),
    };
  }

  get spectatorTftV5() {
    return {
      getByPuuid: ({
        region,
        puuid,
      }: {
        region: RiotAPITypes.LoLRegion;
        puuid: string;
      }): Promise<RiotAPITypes.SpectatorTftV5.CurrentGameInfoDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.SPECTATOR_TFT_V5.GET_GAME_BY_PUUID,
          { puuid },
          { id: `${region}.spectatorTftV5.getByPuuidId.${puuid}` }
        ),
      getFeaturedGames: ({
        region,
      }: {
        region: RiotAPITypes.LoLRegion;
      }): Promise<RiotAPITypes.SpectatorTftV5.FeaturedGamesDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.SPECTATOR_TFT_V5.GET_FEATURED_GAMES,
          {},
          { id: `${region}.spectatorTftV5.getFeaturedGames` }
        ),
    };
  }

  get spectator() {
    return {
      getBySummonerId: ({
        region,
        summonerId,
      }: {
        region: RiotAPITypes.LoLRegion;
        summonerId: string;
      }): Promise<RiotAPITypes.Spectator.CurrentGameInfoDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.SPECTATOR.GET_GAME_BY_SUMMONER_ID,
          { summonerId },
          { id: `${region}.spectator.getBySummonerId.${summonerId}` }
        ),
      getFeaturedGames: ({
        region,
      }: {
        region: RiotAPITypes.LoLRegion;
      }): Promise<RiotAPITypes.Spectator.FeaturedGamesDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.SPECTATOR.GET_FEATURED_GAMES,
          {},
          { id: `${region}.spectator.getFeaturedGames` }
        ),
    };
  }

  get summoner() {
    return {
      getByRsoPUUID: ({
        region,
        rsoPuuid,
      }: {
        region: RiotAPITypes.LoLRegion;
        rsoPuuid: string;
      }): Promise<RiotAPITypes.Summoner.SummonerDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.SUMMONER.GET_BY_RSO_PUUID,
          { rsoPuuid },
          { id: `${region}.summoner.getByRsoPUUID.${rsoPuuid}` }
        ),
      getByAccountId: ({
        region,
        accountId,
      }: {
        region: RiotAPITypes.LoLRegion;
        accountId: string;
      }): Promise<RiotAPITypes.Summoner.SummonerDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.SUMMONER.GET_BY_ACCOUNT_ID,
          { accountId },
          { id: `${region}.summoner.getByAccountId.${accountId}` }
        ),
      getByPUUID: ({
        region,
        puuid,
      }: {
        region: RiotAPITypes.LoLRegion;
        puuid: string;
      }): Promise<RiotAPITypes.Summoner.SummonerDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.SUMMONER.GET_BY_PUUID,
          { puuid },
          { id: `${region}.summoner.getByPUUID.${puuid}` }
        ),
      getBySummonerId: ({
        region,
        summonerId,
      }: {
        region: RiotAPITypes.LoLRegion;
        summonerId: string;
      }): Promise<RiotAPITypes.Summoner.SummonerDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.SUMMONER.GET_BY_SUMMONER_ID,
          { summonerId },
          { id: `${region}.summoner.getBySummonerId.${summonerId}` }
        ),
      getByAccessToken: ({
        region,
        accessToken,
      }: {
        region: RiotAPITypes.LoLRegion;
        accessToken: string;
      }): Promise<RiotAPITypes.Summoner.SummonerDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.SUMMONER.GET_BY_ACCESS_TOKEN,
          {},
          {
            id: `${region}.summoner.getByAccessToken`,
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        ),
    };
  }

  get tftLeague() {
    return {
      getChallenger: ({
        region,
      }: {
        region: RiotAPITypes.LoLRegion;
      }): Promise<RiotAPITypes.TftLeague.LeagueListDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.TFT_LEAGUE.GET_CHALLENGER,
          {},
          { id: `${region}.tftLeague.getChallenger` }
        ),
      getEntriesBySummonerId: ({
        region,
        summonerId,
      }: {
        region: RiotAPITypes.LoLRegion;
        summonerId: string;
      }): Promise<RiotAPITypes.TftLeague.LeagueEntryDTO[]> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.TFT_LEAGUE.GET_ENTRIES_BY_SUMMONER,
          { summonerId },
          { id: `${region}.tftLeague.getEntriesBySummonerId.${summonerId}` }
        ),
      getAllEntries: ({
        region,
        tier,
        division,
        params,
      }: {
        region: RiotAPITypes.LoLRegion;
        tier: RiotAPITypes.TFT_TIER;
        division: RiotAPITypes.DIVISION;
        params?: {
          page?: number;
        };
      }): Promise<RiotAPITypes.TftLeague.LeagueEntryDTO[]> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.TFT_LEAGUE.GET_ALL_ENTRIES,
          { tier, division },
          {
            id: `${region}.tftLeague.getAllEntries.${tier}.${division}`,
            params,
          }
        ),
      getGrandmaster: ({
        region,
      }: {
        region: RiotAPITypes.LoLRegion;
      }): Promise<RiotAPITypes.TftLeague.LeagueListDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.TFT_LEAGUE.GET_GRANDMASTER,
          {},
          { id: `${region}.tftLeague.getGrandmaster` }
        ),
      getLeagueById: ({
        region,
        leagueId,
      }: {
        region: RiotAPITypes.LoLRegion;
        leagueId: string;
      }): Promise<RiotAPITypes.TftLeague.LeagueListDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.TFT_LEAGUE.GET_LEAGUE_BY_ID,
          { leagueId },
          { id: `${region}.tftLeague.getLeagueById.${leagueId}` }
        ),
      getMaster: ({
        region,
      }: {
        region: RiotAPITypes.LoLRegion;
      }): Promise<RiotAPITypes.TftLeague.LeagueListDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.TFT_LEAGUE.GET_MASTER,
          {},
          { id: `${region}.tftLeague.getMaster` }
        ),
      getTopRatedLadderByQueue: ({
        region,
        queue,
      }: {
        region: RiotAPITypes.LoLRegion;
        queue: string;
      }): Promise<RiotAPITypes.TftLeague.TopRatedLadderEntryDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.TFT_LEAGUE.GET_TOP_RATED_LADDER_BY_QUEUE,
          { queue },
          { id: `${region}.tftLeague.getTopRatedLadderByQueue.${queue}` }
        ),
    };
  }

  get tftMatch() {
    return {
      getMatchIdsByPUUID: ({
        region,
        puuid,
        params,
      }: {
        region: RiotAPITypes.TFTCluster;
        puuid: string;
        params?: {
          start?: number;
          endTime?: number;
          startTime?: number;
          count?: number;
        };
      }): Promise<string[]> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.TFT_MATCH.GET_MATCH_IDS_BY_PUUID,
          { puuid },
          { id: `${region}.tftMatch.getMatchIdsByPUUID.${puuid}`, params }
        ),
      getById: ({
        region,
        matchId,
      }: {
        region: RiotAPITypes.TFTCluster;
        matchId: string;
      }): Promise<RiotAPITypes.TftMatch.MatchDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.TFT_MATCH.GET_MATCH_BY_ID,
          { matchId },
          { id: `${region}.tftMatch.getById.${matchId}` }
        ),
    };
  }

  get tftSummoner() {
    return {
      getByAccountId: ({
        region,
        accountId,
      }: {
        region: RiotAPITypes.LoLRegion;
        accountId: string;
      }): Promise<RiotAPITypes.Summoner.SummonerDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.TFT_SUMMONER.GET_BY_ACCOUNT_ID,
          { accountId },
          { id: `${region}.tftSummoner.getByAccountId.${accountId}` }
        ),
      getByAccessToken: ({
        region,
        accessToken,
      }: {
        region: RiotAPITypes.LoLRegion;
        accessToken: string;
      }): Promise<RiotAPITypes.Summoner.SummonerDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.TFT_SUMMONER.GET_BY_ACCESS_TOKEN,
          {},
          {
            id: `${region}.tftSummoner.getByAccessToken`,
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        ),
      getByPUUID: ({
        region,
        puuid,
      }: {
        region: RiotAPITypes.LoLRegion;
        puuid: string;
      }): Promise<RiotAPITypes.Summoner.SummonerDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.TFT_SUMMONER.GET_BY_PUUID,
          { puuid },
          { id: `${region}.tftSummoner.getByPUUID.${puuid}` }
        ),
      getBySummonerId: ({
        region,
        summonerId,
      }: {
        region: RiotAPITypes.LoLRegion;
        summonerId: string;
      }): Promise<RiotAPITypes.Summoner.SummonerDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.TFT_SUMMONER.GET_BY_SUMMONER_ID,
          { summonerId },
          { id: `${region}.tftSummoner.getBySummonerId.${summonerId}` }
        ),
    };
  }

  get tournamentStubV5() {
    return {
      createCodes: ({
        params,
        body,
      }: {
        params: {
          count: number;
          tournamentId: number;
        };
        body: RiotAPITypes.TournamentV5.TournamentCodeParametersV5DTO;
      }): Promise<string[]> =>
        this.request(
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT_STUB_V5.POST_CREATE_CODES,
          {},
          {
            id: `${PlatformId.AMERICAS}.tournamentStubV5.createCodes.${params.tournamentId}`,
            params,
            body,
            method: "POST",
          }
        ),
      getByTournamentCode: ({
        tournamentCode,
      }: {
        tournamentCode: string;
      }): Promise<RiotAPITypes.TournamentV5.TournamentCodeV5DTO> =>
        this.request(
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT_STUB_V5.GET_TOURNAMENT_BY_CODE,
          { tournamentCode },
          {
            id: `${PlatformId.AMERICAS}.tournamentStubV5.getByTournamentCode.${tournamentCode}`,
            priority: 0,
          }
        ),
      getLobbyEventsByTournamentCode: ({
        tournamentCode,
      }: {
        tournamentCode: string;
      }): Promise<RiotAPITypes.TournamentV5.LobbyEventV5DTOWrapper> =>
        this.request(
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT_STUB_V5
            .GET_LOBBY_EVENTS_BY_TOURNAMENT_CODE,
          { tournamentCode },
          {
            id: `${PlatformId.AMERICAS}.tournamentStubV5.getLobbyEventsByTournamentCode.${tournamentCode}`,
          }
        ),
      createProvider: ({
        body,
      }: {
        body: RiotAPITypes.TournamentV5.ProviderRegistrationParametersV5DTO;
      }): Promise<number> =>
        this.request(
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT_STUB_V5.POST_CREATE_PROVIDER,
          {},
          {
            id: `${PlatformId.AMERICAS}.tournamentStubV5.createProvider`,

            body,
            method: "POST",
          }
        ),
      createTournament: ({
        body,
      }: {
        body: RiotAPITypes.TournamentV5.TournamentRegistrationParametersV5DTO;
      }): Promise<number> =>
        this.request(
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT_STUB_V5.POST_CREATE_TOURNAMENT,
          {},
          {
            id: `${PlatformId.AMERICAS}.tournamentStubV5.createTournament`,
            body,
            method: "POST",
          }
        ),
    };
  }

  get tournamentV5() {
    return {
      createCodes: ({
        params,
        body,
      }: {
        params: {
          count: number;
          tournamentId: number;
        };
        body: RiotAPITypes.TournamentV5.TournamentCodeParametersV5DTO;
      }): Promise<string[]> =>
        this.request(
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT_V5.POST_CREATE_CODES,
          {},
          {
            id: `${PlatformId.AMERICAS}.tournamentV5.createCodes.${params.tournamentId}`,
            priority: 0,
            params,
            body,
            method: "POST",
          }
        ),
      getByTournamentCode: ({
        tournamentCode,
      }: {
        tournamentCode: string;
      }): Promise<RiotAPITypes.TournamentV5.TournamentCodeV5DTO> =>
        this.request(
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT_V5.GET_TOURNAMENT_BY_CODE,
          { tournamentCode },
          {
            id: `${PlatformId.AMERICAS}.tournamentV5.getByTournamentCode.${tournamentCode}`,
            priority: 0,
          }
        ),
      updateByTournamentCode: ({
        tournamentCode,
        body,
      }: {
        tournamentCode: string;
        body: RiotAPITypes.TournamentV5.TournamentCodeUpdateParametersV5DTO;
      }): Promise<any> =>
        this.request(
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT_V5.GET_TOURNAMENT_BY_CODE,
          { tournamentCode },
          {
            id: `${PlatformId.AMERICAS}.tournamentV5.updateByTournamentCode.${tournamentCode}`,
            priority: 0,
            body,
            method: "POST",
          }
        ),
      getTournamentGameDetailsByTournamentCode: ({
        tournamentCode,
      }: {
        tournamentCode: string;
      }): Promise<RiotAPITypes.TournamentV5.TournanmentGamesV5DTO[]> =>
        this.request(
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT_V5.GET_TOURNAMENT_GAME_DETAILS,
          { tournamentCode },
          {
            id: `${PlatformId.AMERICAS}.tournamentV5.getTournamentGameDetailsByTournamentCode.${tournamentCode}`,
            priority: 0,
          }
        ),
      getLobbyEventsByTournamentCode: ({
        tournamentCode,
      }: {
        tournamentCode: string;
      }): Promise<RiotAPITypes.TournamentV5.LobbyEventV5DTOWrapper> =>
        this.request(
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT_V5
            .GET_LOBBY_EVENTS_BY_TOURNAMENT_CODE,
          { tournamentCode },
          {
            id: `${PlatformId.AMERICAS}.tournamentV5.getLobbyEventsByTournamentCode.${tournamentCode}`,
            priority: 0,
          }
        ),
      createProvider: ({
        body,
      }: {
        body: RiotAPITypes.TournamentV5.ProviderRegistrationParametersV5DTO;
      }): Promise<number> =>
        this.request(
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT_V5.POST_CREATE_PROVIDER,
          {},
          {
            id: `${PlatformId.AMERICAS}.tournamentV5.createProvider`,
            priority: 0,
            body,
            method: "POST",
          }
        ),
      createTournament: ({
        body,
      }: {
        body: RiotAPITypes.TournamentV5.TournamentRegistrationParametersV5DTO;
      }): Promise<number> =>
        this.request(
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT_V5.POST_CREATE_TOURNAMENT,
          {},
          {
            id: `${PlatformId.AMERICAS}.tournamentV5.createTournament`,
            priority: 0,
            body,
            method: "POST",
          }
        ),
    };
  }

  get valContent() {
    return {
      getContent: ({
        region,
        params,
      }: {
        region: RiotAPITypes.VALCluster;
        params?: {
          locale?: string;
        };
      }): Promise<RiotAPITypes.ValContent.ContentDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.VAL_CONTENT.GET_CONTENT,
          {},
          { id: `${region}.valContent.getContent`, params }
        ),
    };
  }

  get valMatch() {
    return {
      getById: ({
        region,
        matchId,
      }: {
        region: RiotAPITypes.VALCluster;
        matchId: string;
      }): Promise<RiotAPITypes.ValMatch.MatchDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.VAL_MATCH.GET_MATCH_BY_ID,
          { matchId },
          { id: `${region}.valMatch.getById.${matchId}` }
        ),
      getMatchlistByPUUID: ({
        region,
        puuid,
      }: {
        region: RiotAPITypes.VALCluster;
        puuid: string;
      }): Promise<RiotAPITypes.ValMatch.MatchlistDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.VAL_MATCH.GET_MATCHLIST_BY_PUUID,
          { puuid },
          { id: `${region}.valMatch.getMatchlistByPUUID.${puuid}` }
        ),
      getRecentMatchesByQueue: ({
        region,
        queue,
      }: {
        region: RiotAPITypes.VALCluster;
        queue: RiotAPITypes.VAL_QUEUE;
      }): Promise<RiotAPITypes.ValMatch.RecentMatchesDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.VAL_MATCH.GET_RECENT_MATCHES_BY_QUEUE,
          { queue },
          { id: `${region}.valMatch.getRecentMatchesByQueue.${queue}` }
        ),
    };
  }

  get valRanked() {
    return {
      getLeaderboardByQueue: ({
        region,
        queue,
        params,
      }: {
        region: Exclude<RiotAPITypes.VALCluster, PlatformId.ESPORTS>;
        queue: string;
        params?: {
          size?: number;
          startIndex?: number;
        };
      }): Promise<RiotAPITypes.ValMatch.RecentMatchesDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.VAL_RANKED.GET_LEADERBOARD_BY_QUEUE,
          { actId: queue },
          { id: `${region}.valRanked.getLeaderboardByQueue.${queue}`, params }
        ),
    };
  }
}
