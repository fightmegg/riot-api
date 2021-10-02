import {
  RiotRateLimiter,
  METHODS,
  HOST,
  PlatformId,
} from "@fightmegg/riot-rate-limiter";
import Bottleneck from "bottleneck";
import Redis from "ioredis";
import { compile } from "path-to-regexp";
import qs from "querystring";
import { RiotAPITypes } from "./@types";
import { MemoryCache, RedisCache } from "./cache";
import { DDragon } from "./ddragon";

const debugCache = require("debug")("riotapi:cache");

const createHost = compile(HOST, { encode: encodeURIComponent });

const getPath = (key: string): any => {
  let path = METHODS;

  key.split(".").forEach((p: string) => {
    path = path[p];
  });

  return path;
};

export { RiotAPITypes, PlatformId, DDragon };

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
      this.cache = new RedisCache(
        this.config.cache?.client as Redis.RedisOptions
      );
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
    methodKey: string,
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
        region: RiotAPITypes.Cluster;
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
        region: RiotAPITypes.Cluster;
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
      getActiveShardForPlayer: ({
        region,
        game,
        puuid,
      }: {
        region: RiotAPITypes.Cluster;
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
      getEntriesBySummonerId: ({
        region,
        summonerId,
      }: {
        region: RiotAPITypes.LoLRegion;
        summonerId: string;
      }): Promise<RiotAPITypes.League.LeagueEntryDTO[]> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.LEAGUE.GET_ENTRIES_BY_SUMMONER,
          { summonerId },
          {
            id: `${region}.league.getEntriesBySummonerId.${summonerId}`,
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

  get lorMatch() {
    return {
      getMatchIdsByPUUID: ({
        region,
        puuid,
      }: {
        region: RiotAPITypes.LORCluster;
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
        region: RiotAPITypes.LORCluster;
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
        region: RiotAPITypes.LORCluster;
      }): Promise<RiotAPITypes.LorRanked.LeaderboardDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.LOR_RANKED.GET_MASTER_TIER,
          {},
          { id: `${region}.lorRanked.getMasterTier` }
        ),
    };
  }

  get match() {
    return {
      getIdsByTournamentCode: ({
        region,
        tournamentCode,
      }: {
        region: RiotAPITypes.LoLRegion;
        tournamentCode: string;
      }): Promise<number[]> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.MATCH.GET_IDS_BY_TOURNAMENT_CODE,
          { tournamentCode },
          { id: `${region}.match.getIdsByTournamentCode.${tournamentCode}` }
        ),
      getById: ({
        region,
        matchId,
      }: {
        region: RiotAPITypes.LoLRegion;
        matchId: number;
      }): Promise<RiotAPITypes.Match.MatchDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.MATCH.GET_MATCH_BY_ID,
          { matchId },
          { id: `${region}.match.getById.${matchId}` }
        ),
      getByIdAndTournamentCode: ({
        region,
        matchId,
        tournamentCode,
      }: {
        region: RiotAPITypes.LoLRegion;
        matchId: number;
        tournamentCode: string;
      }): Promise<RiotAPITypes.Match.MatchDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.MATCH.GET_MATCH_BY_ID_AND_TOURNAMENT_CODE,
          { matchId, tournamentCode },
          {
            id: `${region}.match.getByIdAndTournamentCode.${matchId}.${tournamentCode}`,
          }
        ),
      getMatchlistByAccount: ({
        region,
        accountId,
        params,
      }: {
        region: RiotAPITypes.LoLRegion;
        accountId: string;
        params?: {
          champion?: number[];
          queue?: number[];
          season?: number[];
          endTime?: number;
          beginTime?: number;
          endIndex?: number;
          beginIndex?: number;
        };
      }): Promise<RiotAPITypes.Match.MatchlistDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.MATCH.GET_MATCHLIST_BY_ACCOUNT,
          { accountId },
          {
            id: `${region}.match.getMatchlistByAccount.${accountId}`,
            params,
          }
        ),
      getTimelineById: ({
        region,
        matchId,
      }: {
        region: RiotAPITypes.LoLRegion;
        matchId: number;
      }): Promise<RiotAPITypes.Match.MatchTimelineDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.MATCH.GET_TIMELINE_BY_MATCH_ID,
          { matchId },
          {
            id: `${region}.match.getTimelineById.${matchId}`,
          }
        ),
    };
  }

  get matchV5() {
    return {
      getIdsbyPuuid: ({
        cluster,
        puuid,
        params,
      }: {
        cluster: RiotAPITypes.Cluster;
        puuid: string;
        params?: {
          queue?: number;
          type?: RiotAPITypes.MatchV5.MatchType;
          start?: number;
          count?: number;
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
        cluster: RiotAPITypes.Cluster;
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
        cluster: RiotAPITypes.Cluster;
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
      getBySummonerName: ({
        region,
        summonerName,
      }: {
        region: RiotAPITypes.LoLRegion;
        summonerName: string;
      }): Promise<RiotAPITypes.Summoner.SummonerDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.SUMMONER.GET_BY_SUMMONER_NAME,
          { summonerName },
          { id: `${region}.summoner.getBySummonerName.${summonerName}` }
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
    };
  }

  get tftMatch() {
    return {
      getMatchIdsByPUUID: ({
        region,
        puuid,
        params,
      }: {
        region: RiotAPITypes.Cluster;
        puuid: string;
        params?: {
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
        region: RiotAPITypes.Cluster;
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
      getBySummonerName: ({
        region,
        summonerName,
      }: {
        region: RiotAPITypes.LoLRegion;
        summonerName: string;
      }): Promise<RiotAPITypes.Summoner.SummonerDTO> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.TFT_SUMMONER.GET_BY_SUMMONER_NAME,
          { summonerName },
          { id: `${region}.tftSummoner.getBySummonerName.${summonerName}` }
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

  get thirdPartyCode() {
    return {
      getBySummonerId: ({
        region,
        summonerId,
      }: {
        region: RiotAPITypes.LoLRegion;
        summonerId: string;
      }): Promise<string> =>
        this.request(
          region,
          RiotAPITypes.METHOD_KEY.THIRD_PARTY_CODE.GET_BY_SUMMONER_ID,
          { summonerId },
          { id: `${region}.thirdPartyCode.getBySummonerId.${summonerId}` }
        ),
    };
  }

  get tournamentStub() {
    return {
      createCodes: ({
        params,
        body,
      }: {
        params: {
          count: number;
          tournamentId: number;
        };
        body: RiotAPITypes.Tournament.TournamentCodeParametersDTO;
      }): Promise<string[]> =>
        this.request(
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT_STUB.POST_CREATE_CODES,
          {},
          {
            id: `${PlatformId.AMERICAS}.tournamentStub.createCodes.${params.tournamentId}`,
            params,
            body,
            method: "POST",
          }
        ),
      getLobbyEventsByTournamentCode: ({
        tournamentCode,
      }: {
        tournamentCode: string;
      }): Promise<RiotAPITypes.Tournament.LobbyEventDTOWrapper> =>
        this.request(
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT_STUB
            .GET_LOBBY_EVENTS_BY_TOURNAMENT_CODE,
          { tournamentCode },
          {
            id: `${PlatformId.AMERICAS}.tournamentStub.getLobbyEventsByTournamentCode.${tournamentCode}`,
          }
        ),
      createProvider: ({
        body,
      }: {
        body: RiotAPITypes.Tournament.ProviderRegistrationParametersDTO;
      }): Promise<number> =>
        this.request(
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT_STUB.POST_CREATE_PROVIDER,
          {},
          {
            id: `${PlatformId.AMERICAS}.tournamentStub.createProvider`,

            body,
            method: "POST",
          }
        ),
      createTournament: ({
        body,
      }: {
        body: RiotAPITypes.Tournament.TournamentRegistrationParametersDTO;
      }): Promise<number> =>
        this.request(
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT_STUB.POST_CREATE_TOURNAMENT,
          {},
          {
            id: `${PlatformId.AMERICAS}.tournamentStub.createTournament`,
            body,
            method: "POST",
          }
        ),
    };
  }

  get tournament() {
    return {
      createCodes: ({
        params,
        body,
      }: {
        params: {
          count: number;
          tournamentId: number;
        };
        body: RiotAPITypes.Tournament.TournamentCodeParametersDTO;
      }): Promise<string[]> =>
        this.request(
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT.POST_CREATE_CODES,
          {},
          {
            id: `${PlatformId.AMERICAS}.tournament.createCodes.${params.tournamentId}`,
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
      }): Promise<RiotAPITypes.Tournament.TournamentCodeDTO> =>
        this.request(
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT.GET_TOURNAMENT_BY_CODE,
          { tournamentCode },
          {
            id: `${PlatformId.AMERICAS}.tournament.getByTournamentCode.${tournamentCode}`,
            priority: 0,
          }
        ),
      updateByTournamentCode: ({
        tournamentCode,
        body,
      }: {
        tournamentCode: string;
        body: RiotAPITypes.Tournament.TournamentCodeUpdateParametersDTO;
      }): Promise<any> =>
        this.request(
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT.GET_TOURNAMENT_BY_CODE,
          { tournamentCode },
          {
            id: `${PlatformId.AMERICAS}.tournament.updateByTournamentCode.${tournamentCode}`,
            priority: 0,
            body,
            method: "POST",
          }
        ),
      getLobbyEventsByTournamentCode: ({
        tournamentCode,
      }: {
        tournamentCode: string;
      }): Promise<RiotAPITypes.Tournament.LobbyEventDTOWrapper> =>
        this.request(
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT
            .GET_LOBBY_EVENTS_BY_TOURNAMENT_CODE,
          { tournamentCode },
          {
            id: `${PlatformId.AMERICAS}.tournament.getLobbyEventsByTournamentCode.${tournamentCode}`,
            priority: 0,
          }
        ),
      createProvider: ({
        body,
      }: {
        body: RiotAPITypes.Tournament.ProviderRegistrationParametersDTO;
      }): Promise<number> =>
        this.request(
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT.POST_CREATE_PROVIDER,
          {},
          {
            id: `${PlatformId.AMERICAS}.tournament.createProvider`,
            priority: 0,
            body,
            method: "POST",
          }
        ),
      createTournament: ({
        body,
      }: {
        body: RiotAPITypes.Tournament.TournamentRegistrationParametersDTO;
      }): Promise<number> =>
        this.request(
          PlatformId.AMERICAS,
          RiotAPITypes.METHOD_KEY.TOURNAMENT.POST_CREATE_TOURNAMENT,
          {},
          {
            id: `${PlatformId.AMERICAS}.tournament.createTournament`,
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
      }): Promise<RiotAPITypes.ValContent.ContentItemDTO> =>
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
}
