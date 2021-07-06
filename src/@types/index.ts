import { PlatformId } from "@fightmegg/riot-rate-limiter";
import Redis from "ioredis";

export namespace RiotAPITypes {
  export interface Config {
    debug?: boolean;
    cache?: {
      cacheType: "local" | "ioredis";
      client?: Redis.RedisOptions | string;
      ttls?: {
        byMethod: { [key: string]: number };
      };
    };
  }

  export interface RequestOptions {
    id: string;
    priority?: number;
    expiration?: number;
    params?: { [key: string]: string | number | number[] | undefined };
    body?: object;
    method?: "POST" | "GET" | "PUT";
    headers?: { [key: string]: string };
  }

  export enum QUEUE {
    RANKED_SOLO_5x5 = "RANKED_SOLO_5x5",
    RANKED_TFT = "RANKED_TFT",
    RANKED_FLEX_SR = "RANKED_FLEX_SR",
    RANKED_FLEX_TT = "RANKED_FLEX_TT",
  }

  export enum TIER {
    CHALLENGER = "CHALLENGER",
    GRANDMASTER = "GRANDMASTER",
    MASTER = "MASTER",
    DIAMOND = "DIAMOND",
    PLATINUM = "PLATINUM",
    GOLD = "GOLD",
    SILVER = "SILVER",
    BRONZE = "BRONZE",
    IRON = "IRON",
  }

  export enum TFT_TIER {
    DIAMOND = "DIAMOND",
    PLATINUM = "PLATINUM",
    GOLD = "GOLD",
    SILVER = "SILVER",
    BRONZE = "BRONZE",
    IRON = "IRON",
  }

  export enum DIVISION {
    I = "I",
    II = "II",
    III = "III",
    IV = "IV",
  }

  export enum VAL_QUEUE {
    COMPETITIVE = "competitive",
    UNRATED = "unrated",
    SPIKERUSH = "spikerush",
  }

  export type VALCluster =
    | PlatformId.AP
    | PlatformId.BR
    | PlatformId.EU
    | PlatformId.KR
    | PlatformId.LATAM
    | PlatformId.NA;

  export type LORCluster =
    | PlatformId.AMERICAS
    | PlatformId.ASIA
    | PlatformId.EUROPE
    | PlatformId.SEA;

  export type Cluster =
    | PlatformId.EUROPE
    | PlatformId.AMERICAS
    | PlatformId.ASIA;

  export type LoLRegion =
    | PlatformId.BR1
    | PlatformId.EUNE1
    | PlatformId.EUW1
    | PlatformId.JP1
    | PlatformId.KR
    | PlatformId.LA1
    | PlatformId.LA2
    | PlatformId.NA1
    | PlatformId.OC1
    | PlatformId.RU
    | PlatformId.TR1;

  export namespace METHOD_KEY {
    export namespace ACCOUNT {
      export const GET_BY_PUUID = "ACCOUNT.GET_BY_PUUID";
      export const GET_BY_RIOT_ID = "ACCOUNT.GET_BY_RIOT_ID";
      export const GET_ACTIVE_SHARD_FOR_PLAYER =
        "ACCOUNT.GET_ACTIVE_SHARD_FOR_PLAYER";
    }
    export namespace CHAMPION_MASTERY {
      export const GET_ALL_CHAMPIONS = "CHAMPION_MASTERY.GET_ALL_CHAMPIONS";
      export const GET_CHAMPION_MASTERY =
        "CHAMPION_MASTERY.GET_CHAMPION_MASTERY";
      export const GET_CHAMPION_MASTERY_SCORE =
        "CHAMPION_MASTERY.GET_CHAMPION_MASTERY_SCORE";
    }
    export namespace CHAMPION {
      export const GET_CHAMPION_ROTATIONS = "CHAMPION.GET_CHAMPION_ROTATIONS";
    }
    export namespace CLASH {
      export const GET_PLAYERS_BY_SUMMONER = "CLASH.GET_PLAYERS_BY_SUMMONER";
      export const GET_TEAM = "CLASH.GET_TEAM";
      export const GET_TOURNAMENTS = "CLASH.GET_TOURNAMENTS";
      export const GET_TOURNAMENT = "CLASH.GET_TOURNAMENT";
      export const GET_TOURNAMENT_TEAM = "CLASH.GET_TOURNAMENT_TEAM";
    }
    export namespace LEAGUE_EXP {
      export const GET_LEAGUE_ENTRIES = "LEAGUE_EXP.GET_LEAGUE_ENTRIES";
    }
    export namespace LEAGUE {
      export const GET_CHALLENGER_BY_QUEUE = "LEAGUE.GET_CHALLENGER_BY_QUEUE";
      export const GET_ENTRIES_BY_SUMMONER = "LEAGUE.GET_ENTRIES_BY_SUMMONER";
      export const GET_ALL_ENTRIES = "LEAGUE.GET_ALL_ENTRIES";
      export const GET_GRANDMASTER_BY_QUEUE = "LEAGUE.GET_GRANDMASTER_BY_QUEUE";
      export const GET_LEAGUE_BY_ID = "LEAGUE.GET_LEAGUE_BY_ID";
      export const GET_MASTER_BY_QUEUE = "LEAGUE.GET_MASTER_BY_QUEUE";
    }

    export namespace LOR_MATCH {
      export const GET_MATCH_IDS_BY_PUUID = "LOR_RANKED.GET_MATCH_IDS_BY_PUUID";
      export const GET_MATCH_BY_ID = "LOR_RANKED.GET_MATCH_BY_ID";
    }
    export namespace LOR_RANKED {
      export const GET_MASTER_TIER = "LOR_RANKED.GET_MASTER_TIER";
    }
    export namespace MATCH {
      export const GET_IDS_BY_TOURNAMENT_CODE =
        "MATCH.GET_IDS_BY_TOURNAMENT_CODE";
      export const GET_MATCH_BY_ID = "MATCH.GET_MATCH_BY_ID";
      export const GET_MATCH_BY_ID_AND_TOURNAMENT_CODE =
        "MATCH.GET_MATCH_BY_ID_AND_TOURNAMENT_CODE";
      export const GET_MATCHLIST_BY_ACCOUNT = "MATCH.GET_MATCHLIST_BY_ACCOUNT";
      export const GET_TIMELINE_BY_MATCH_ID = "MATCH.GET_TIMELINE_BY_MATCH_ID";
    }
    export namespace MATCH_V5 {
      export const GET_IDS_BY_PUUID = "MATCH_V5.GET_IDS_BY_PUUID";
      export const GET_MATCH_BY_ID = "MATCH_V5.GET_MATCH_BY_ID";
      export const GET_MATCH_TIMELINE_BY_ID =
        "MATCH_V5.GET_MATCH_TIMELINE_BY_ID";
    }
    export namespace SPECTATOR {
      export const GET_GAME_BY_SUMMONER_ID =
        "SPECTATOR.GET_GAME_BY_SUMMONER_ID";
      export const GET_FEATURED_GAMES = "SPECTATOR.GET_FEATURED_GAMES";
    }
    export namespace SUMMONER {
      export const GET_BY_ACCOUNT_ID = "SUMMONER.GET_BY_ACCOUNT_ID";
      export const GET_BY_SUMMONER_NAME = "SUMMONER.GET_BY_SUMMONER_NAME";
      export const GET_BY_PUUID = "SUMMONER.GET_BY_PUUID";
      export const GET_BY_SUMMONER_ID = "SUMMONER.GET_BY_SUMMONER_ID";
      export const GET_BY_ACCESS_TOKEN = "SUMMONER.GET_BY_ACCESS_TOKEN";
    }
    export namespace TFT_LEAGUE {
      export const GET_CHALLENGER = "TFT_LEAGUE.GET_CHALLENGER";
      export const GET_ENTRIES_BY_SUMMONER =
        "TFT_LEAGUE.GET_ENTRIES_BY_SUMMONER";
      export const GET_ALL_ENTRIES = "TFT_LEAGUE.GET_ALL_ENTRIES";
      export const GET_GRANDMASTER = "TFT_LEAGUE.GET_GRANDMASTER";
      export const GET_LEAGUE_BY_ID = "TFT_LEAGUE.GET_LEAGUE_BY_ID";
      export const GET_MASTER = "TFT_LEAGUE.GET_MASTER";
    }
    export namespace TFT_MATCH {
      export const GET_MATCH_IDS_BY_PUUID = "TFT_MATCH.GET_MATCH_IDS_BY_PUUID";
      export const GET_MATCH_BY_ID = "TFT_MATCH.GET_MATCH_BY_ID";
    }
    export namespace TFT_SUMMONER {
      export const GET_BY_ACCOUNT_ID = "TFT_SUMMONER.GET_BY_ACCOUNT_ID";
      export const GET_BY_SUMMONER_NAME = "TFT_SUMMONER.GET_BY_SUMMONER_NAME";
      export const GET_BY_PUUID = "TFT_SUMMONER.GET_BY_PUUID";
      export const GET_BY_SUMMONER_ID = "TFT_SUMMONER.GET_BY_SUMMONER_ID";
    }
    export namespace THIRD_PARTY_CODE {
      export const GET_BY_SUMMONER_ID = "THIRD_PARTY_CODE.GET_BY_SUMMONER_ID";
    }
    export namespace TOURNAMENT_STUB {
      export const POST_CREATE_CODES = "TOURNAMENT_STUB.POST_CREATE_CODES";
      export const GET_LOBBY_EVENTS_BY_TOURNAMENT_CODE =
        "TOURNAMENT_STUB.GET_LOBBY_EVENTS_BY_TOURNAMENT_CODE";
      export const POST_CREATE_PROVIDER =
        "TOURNAMENT_STUB.POST_CREATE_PROVIDER";
      export const POST_CREATE_TOURNAMENT =
        "TOURNAMENT_STUB.POST_CREATE_TOURNAMENT";
    }
    export namespace TOURNAMENT {
      export const POST_CREATE_CODES = "TOURNAMENT.POST_CREATE_CODES";
      export const GET_TOURNAMENT_BY_CODE = "TOURNAMENT.GET_TOURNAMENT_BY_CODE";
      export const PUT_TOURNAMENT_CODE = "TOURNAMENT.PUT_TOURNAMENT_CODE";
      export const GET_LOBBY_EVENTS_BY_TOURNAMENT_CODE =
        "TOURNAMENT.GET_LOBBY_EVENTS_BY_TOURNAMENT_CODE";
      export const POST_CREATE_PROVIDER = "TOURNAMENT.POST_CREATE_PROVIDER";
      export const POST_CREATE_TOURNAMENT = "TOURNAMENT.POST_CREATE_TOURNAMENT";
    }
    export namespace VAL_CONTENT {
      export const GET_CONTENT = "VAL_CONTENT.GET_CONTENT";
    }
    export namespace VAL_MATCH {
      export const GET_MATCH_BY_ID = "VAL_MATCH.GET_MATCH_BY_ID";
      export const GET_MATCHLIST_BY_PUUID = "VAL_MATCH.GET_MATCHLIST_BY_PUUID";
      export const GET_RECENT_MATCHES_BY_QUEUE =
        "VAL_MATCH.GET_RECENT_MATCHES_BY_QUEUE";
    }
  }

  export namespace Account {
    export interface AccountDTO {
      puuid: string;
      gameName?: string;
      tagLine?: string;
    }

    export interface ActiveShardDTO {
      puuid: string;
      game: string;
      activeShard: string;
    }
  }

  export namespace ChampionMastery {
    export interface ChampionMasteryDTO {
      championPointsUntilNextLevel: number;
      chestGranted: boolean;
      championId: number;
      lastPlayTime: number;
      championLevel: number;
      summonerId: string;
      championPoints: number;
      championPointsSinceLastLevel: number;
      tokensEarned: number;
    }
  }

  export namespace Champion {
    export interface ChampionInfoDTO {
      maxNewPlayerLevel: number;
      freeChampionIdsForNewPlayers: number[];
      freeChampionIds: number[];
    }
  }

  export namespace Clash {
    export interface PlayerDTO {
      summonerId: string;
      teamId: string;
      position:
        | "UNSELECTED"
        | "FILL"
        | "TOP"
        | "JUNGLE"
        | "MIDDLE"
        | "BOTTOM"
        | "UTILITY";
      role: "CAPTAIN" | "MEMBER";
    }

    export interface TeamDTO {
      id: string;
      tournamentId: number;
      name: string;
      iconId: number;
      tier: number;
      captain: string; // SummonerId of Captain
      abbreviation: string;
      players: Clash.PlayerDTO[] /** Team members. */;
    }

    export interface TournamentPhaseDTO {
      id: number;
      registrationTime: number;
      startTime: number;
      cancelled: boolean;
    }

    export interface TournamentDTO {
      id: number;
      themeId: number;
      nameKey: string;
      nameKeySecondary: string;
      schedule: Clash.TournamentPhaseDTO[];
    }
  }

  export namespace League {
    export interface MiniSeriesDTO {
      losses: number;
      progress: string;
      target: number;
      wins: number;
    }

    export interface LeagueEntryDTO {
      leagueId: string;
      summonerId: string;
      summonerName: string;
      queueType: string;
      tier: string;
      rank: string;
      leaguePoints: number;
      wins: number;
      losses: number;
      hotStreak: boolean;
      veteran: boolean;
      freshBlood: boolean;
      inactive: boolean;
      miniSeries?: League.MiniSeriesDTO | null;
    }

    export interface LeagueItemDTO {
      freshBlood: boolean;
      wins: number;
      summonerName: string;
      miniSeries?: League.MiniSeriesDTO | null;
      inactive: boolean;
      veteran: boolean;
      hotStreak: boolean;
      rank: string;
      leaguePoints: number;
      losses: number;
      summonerId: string;
    }

    export interface LeagueListDTO {
      leagueId: string;
      entries: League.LeagueItemDTO[];
      tier: string;
      name: string;
      queue: string;
    }
  }

  export namespace LorMatch {
    export interface PlayerDTO {
      puuid: string;
      deck_id: string;
      deck_code: string;
      factions: string[];
      game_outcome: "win" | "loss" | string;
      order_of_play: 1 | 2 | number;
    }
    export interface MatchDTO {
      metadata: {
        data_version: string;
        match_id: string;
        participants: string[];
      };
      info: {
        game_mode: "Constructed" | "Expeditions" | "Tutorial";
        game_type:
          | "Ranked"
          | "Normal"
          | "AI"
          | "Tutorial"
          | "Singleton"
          | "StandardGauntlet";
        game_start_time_utc: string;
        game_version: string;
        players: LorMatch.PlayerDTO[];
        total_turn_count: number;
      };
    }
  }

  export namespace LorRanked {
    export interface PlayerDTO {
      name: string;
      rank: number;
      lp: number;
    }

    export interface LeaderboardDTO {
      /** A list of players in Master tier. */
      players: LorRanked.PlayerDTO[];
    }
  }

  export namespace Match {
    export interface MatchDTO {
      gameId: number;
      participantIdentities: Match.ParticipantIdentityDTO[];
      queueId: number;
      gameType: string;
      gameDuration: number;
      teams: Match.TeamStatsDTO[];
      platformId: string;
      gameCreation: number;
      seasonId: number;
      gameVersion: string;
      mapId: number;
      gameMode: string;
      participants: Match.ParticipantDTO[];
    }

    export interface ParticipantIdentityDTO {
      participantId: number;
      /** Player information not included in the response for custom matches. Custom matches are considered private unless a tournament code was used to create the match. */
      player: Match.PlayerDTO;
    }

    export interface PlayerDTO {
      profileIcon: number;
      /** Player's original accountId. */
      accountId: string;
      matchHistoryUri: string;
      /** Player's current accountId when the match was played. */
      currentAccountId: string;
      /** Player's current platformId when the match was played. */
      currentPlatformId: string;
      summonerName: string;
      /** Player's summonerId (Encrypted) */
      summonerId?: string | null;
      /** Player's original platformId. */
      platformId: string;
    }

    export interface TeamStatsDTO {
      /** Number of towers the team destroyed. */
      towerKills: number;
      /** Number of times the team killed Rift Herald. */
      riftHeraldKills: number;
      /** Flag indicating whether or not the team scored the first blood. */
      firstBlood: boolean;
      /** Number of inhibitors the team destroyed. */
      inhibitorKills: number;
      /** If match queueId has a draft, contains banned champion data, otherwise empty. */
      bans: Match.TeamBansDTO[];
      /** Flag indicating whether or not the team scored the first Baron kill. */
      firstBaron: boolean;
      /** Flag indicating whether or not the team scored the first Dragon kill. */
      firstDragon: boolean;
      /** For Dominion matches, specifies the points the team had at game end. */
      dominionVictoryScore: number;
      /** Number of times the team killed Dragon. */
      dragonKills: number;
      /** Number of times the team killed Baron. */
      baronKills: number;
      /** Flag indicating whether or not the team destroyed the first inhibitor. */
      firstInhibitor: boolean;
      /** Flag indicating whether or not the team destroyed the first tower. */
      firstTower: boolean;
      /** Number of times the team killed Vilemaw. */
      vilemawKills: number;
      /** Flag indicating whether or not the team scored the first Rift Herald kill. */
      firstRiftHerald: boolean;
      /** 100 for blue side. 200 for red side. */
      teamId: number;
      /** String indicating whether or not the team won. There are only two values visibile in public match history.
           (Legal values:  Fail,  Win) */
      win?: "Fail" | "Win" | null;
    }

    export interface TeamBansDTO {
      /** Banned championId. */
      championId: number;
      /** Turn during which the champion was banned. */
      pickTurn: number;
    }

    export interface ParticipantDTO {
      participantId: number;
      championId: number;
      /** List of legacy Rune information. Not included for matches played with Runes Reforged. */
      runes?: Match.RuneDTO[] | null;
      /** Participant statistics. */
      stats: Match.ParticipantStatsDTO;
      /** 100 for blue side. 200 for red side. */
      teamId: number;
      /** Participant timeline data. */
      timeline: Match.ParticipantTimelineDTO;
      /** First Summoner Spell id. */
      spell1Id: number;
      /** Second Summoner Spell id. */
      spell2Id: number;
      /** Highest ranked tier achieved for the previous season in a specific subset of queueIds, if any, otherwise null. Used to display border in game loading screen. Please refer to the Ranked Info documentation.
           (Legal values:  CHALLENGER,  MASTER,  DIAMOND,  PLATINUM,  GOLD,  SILVER,  BRONZE,  UNRANKED) */
      highestAchievedSeasonTier?: TIER | "UNRANKED" | null;
      /** List of legacy Mastery information. Not included for matches played with Runes Reforged. */
      masteries?: Match.MasteryDTO[] | null;
    }

    export interface RuneDTO {
      runeId: number;
      rank: number;
    }

    export interface ParticipantStatsDTO {
      item0: number;
      item2: number;
      totalUnitsHealed: number;
      item1: number;
      largestMultiKill: number;
      goldEarned: number;
      firstInhibitorKill?: boolean | null;
      physicalDamageTaken: number;
      nodeNeutralizeAssist?: number | null;
      totalPlayerScore?: number | null;
      champLevel: number;
      damageDealtToObjectives: number;
      totalDamageTaken: number;
      neutralMinionsKilled: number;
      deaths: number;
      tripleKills: number;
      magicDamageDealtToChampions: number;
      wardsKilled: number;
      pentaKills: number;
      damageSelfMitigated: number;
      largestCriticalStrike: number;
      nodeNeutralize?: number | null;
      totalTimeCrowdControlDealt: number;
      firstTowerKill?: boolean | null;
      magicDamageDealt: number;
      totalScoreRank?: number | null;
      nodeCapture?: number | null;
      wardsPlaced?: number | null;
      totalDamageDealt: number;
      timeCCingOthers: number;
      magicalDamageTaken: number;
      largestKillingSpree: number;
      totalDamageDealtToChampions: number;
      physicalDamageDealtToChampions: number;
      neutralMinionsKilledTeamJungle: number;
      totalMinionsKilled: number;
      firstInhibitorAssist?: boolean | null;
      visionWardsBoughtInGame: number;
      objectivePlayerScore?: number | null;
      kills: number;
      firstTowerAssist?: boolean | null;
      combatPlayerScore?: number | null;
      inhibitorKills?: number | null;
      turretKills?: number | null;
      participantId: number;
      trueDamageTaken: number;
      firstBloodAssist?: boolean | null;
      nodeCaptureAssist?: number | null;
      assists: number;
      teamObjective?: number | null;
      altarsNeutralized?: number | null;
      goldSpent: number;
      damageDealtToTurrets: number;
      altarsCaptured?: number | null;
      win: boolean;
      totalHeal: number;
      unrealKills: number;
      visionScore?: number | null;
      physicalDamageDealt: number;
      firstBloodKill?: boolean | null;
      longestTimeSpentLiving: number;
      killingSprees: number;
      sightWardsBoughtInGame?: number | null;
      trueDamageDealtToChampions: number;
      neutralMinionsKilledEnemyJungle: number;
      doubleKills: number;
      trueDamageDealt: number;
      quadraKills: number;
      item4: number;
      item3: number;
      item6: number;
      item5: number;
      playerScore0?: number | null;
      playerScore1?: number | null;
      playerScore2?: number | null;
      playerScore3?: number | null;
      playerScore4?: number | null;
      playerScore5?: number | null;
      playerScore6?: number | null;
      playerScore7?: number | null;
      playerScore8?: number | null;
      playerScore9?: number | null;
      /** Primary path keystone rune. */
      perk0?: number | null;
      /** Post game rune stats. */
      perk0Var1?: number | null;
      /** Post game rune stats. */
      perk0Var2?: number | null;
      /** Post game rune stats. */
      perk0Var3?: number | null;
      /** Primary path rune. */
      perk1?: number | null;
      /** Post game rune stats. */
      perk1Var1?: number | null;
      /** Post game rune stats. */
      perk1Var2?: number | null;
      /** Post game rune stats. */
      perk1Var3?: number | null;
      /** Primary path rune. */
      perk2?: number | null;
      /** Post game rune stats. */
      perk2Var1?: number | null;
      /** Post game rune stats. */
      perk2Var2?: number | null;
      /** Post game rune stats. */
      perk2Var3?: number | null;
      /** Primary path rune. */
      perk3?: number | null;
      /** Post game rune stats. */
      perk3Var1?: number | null;
      /** Post game rune stats. */
      perk3Var2?: number | null;
      /** Post game rune stats. */
      perk3Var3?: number | null;
      /** Secondary path rune. */
      perk4?: number | null;
      /** Post game rune stats. */
      perk4Var1?: number | null;
      /** Post game rune stats. */
      perk4Var2?: number | null;
      /** Post game rune stats. */
      perk4Var3?: number | null;
      /** Secondary path rune. */
      perk5?: number | null;
      /** Post game rune stats. */
      perk5Var1?: number | null;
      /** Post game rune stats. */
      perk5Var2?: number | null;
      /** Post game rune stats. */
      perk5Var3?: number | null;
      /** Primary rune path */
      perkPrimaryStyle?: number | null;
      /** Secondary rune path */
      perkSubStyle?: number | null;
      /** First stat rune. */
      statPerk0?: number | null;
      /** Second stat rune. */
      statPerk1?: number | null;
      /** Third stat rune. */
      statPerk2?: number | null;
    }

    export interface ParticipantTimelineDTO {
      participantId?: number | null;
      /** Creep score difference versus the calculated lane opponent(s) for a specified period. */
      csDiffPerMinDeltas?: { [key: string]: number } | null;
      /** Damage taken for a specified period. */
      damageTakenPerMinDeltas?: { [key: string]: number } | null;
      /** Participant's calculated role.
           (Legal values:  DUO,  NONE,  SOLO,  DUO_CARRY,  DUO_SUPPORT) */
      role?: "DUO" | "NONE" | "SOLO" | "DUO_CARRY" | "DUO_SUPPORT" | null;
      /** Damage taken difference versus the calculated lane opponent(s) for a specified period. */
      damageTakenDiffPerMinDeltas?: { [key: string]: number } | null;
      /** Experience change for a specified period. */
      xpPerMinDeltas?: { [key: string]: number } | null;
      /** Experience difference versus the calculated lane opponent(s) for a specified period. */
      xpDiffPerMinDeltas?: { [key: string]: number } | null;
      /** Participant's calculated lane. MID and BOT are legacy values.
           (Legal values:  MID,  MIDDLE,  TOP,  JUNGLE,  BOT,  BOTTOM) */
      lane?: "MID" | "MIDDLE" | "TOP" | "JUNGLE" | "BOT" | "BOTTOM" | null;
      /** Creeps for a specified period. */
      creepsPerMinDeltas?: { [key: string]: number } | null;
      /** Gold for a specified period. */
      goldPerMinDeltas?: { [key: string]: number } | null;
    }

    export interface MasteryDTO {
      rank: number;
      masteryId: number;
    }

    export interface MatchlistDTO {
      startIndex: number;
      /** There is a known issue that this field doesn't correctly return the total number of games that match the parameters of the request. Please paginate using beginIndex until you reach the end of a player's matchlist. */
      totalGames: number;
      endIndex: number;
      matches: Match.MatchReferenceDTO[];
    }

    export interface MatchReferenceDTO {
      gameId: number;
      role: string;
      season: number;
      platformId: string;
      champion: number;
      queue: number;
      lane: string;
      timestamp: number;
    }

    export interface MatchTimelineDTO {
      frames: Match.MatchFrameDTO[];
      frameInterval: number;
    }

    export interface MatchFrameDTO {
      participantFrames: { [key: string]: Match.MatchParticipantFrameDTO };
      events: Match.MatchEventDTO[];
      timestamp: number;
    }

    export interface MatchParticipantFrameDTO {
      participantId: number;
      minionsKilled: number;
      teamScore?: number | null;
      dominionScore?: number | null;
      totalGold: number;
      level: number;
      xp: number;
      currentGold: number;
      position?: Match.MatchPositionDTO | null;
      jungleMinionsKilled: number;
    }

    export interface MatchPositionDTO {
      x: number;
      y: number;
    }

    export interface MatchEventDTO {
      laneType?: string | null;
      skillSlot?: number | null;
      ascendedType?: string | null;
      creatorId?: number | null;
      afterId?: number | null;
      eventType?: string | null;
      /** (Legal values:  CHAMPION_KILL,  WARD_PLACED,  WARD_KILL,  BUILDING_KILL,  ELITE_MONSTER_KILL,  ITEM_PURCHASED,  ITEM_SOLD,  ITEM_DESTROYED,  ITEM_UNDO,  SKILL_LEVEL_UP,  ASCENDED_EVENT,  CAPTURE_POINT,  PORO_KING_SUMMON) */
      type:
        | "CHAMPION_KILL"
        | "WARD_PLACED"
        | "WARD_KILL"
        | "BUILDING_KILL"
        | "ELITE_MONSTER_KILL"
        | "ITEM_PURCHASED"
        | "ITEM_SOLD"
        | "ITEM_DESTROYED"
        | "ITEM_UNDO"
        | "SKILL_LEVEL_UP"
        | "ASCENDED_EVENT"
        | "CAPTURE_POINT"
        | "PORO_KING_SUMMON";
      levelUpType?: string | null;
      wardType?: string | null;
      participantId?: number | null;
      towerType?: string | null;
      itemId?: number | null;
      beforeId?: number | null;
      pointCaptured?: string | null;
      monsterType?: string | null;
      monsterSubType?: string | null;
      teamId?: number | null;
      position?: Match.MatchPositionDTO | null;
      killerId?: number | null;
      timestamp: number;
      assistingParticipantIds?: number[] | null;
      buildingType?: string | null;
      victimId?: number | null;
    }
  }

  export namespace MatchV5 {
    export enum MatchType {
      Ranked = "ranked",
      Normal = "normal",
      Tourney = "tourney",
      Tutorial = "tutorial",
    }

    export interface StatPerksDTO {
      defense: number;
      flex: number;
      offense: number;
    }

    export interface SelectionDTO {
      perk: number;
      var1: number;
      var2: number;
      var3: number;
    }

    export interface StyleDTO {
      description: string;
      selections: SelectionDTO[];
      style: number;
    }

    export interface PerksDTO {
      statPerks: StatPerksDTO;
      styles: StyleDTO[];
    }

    export interface ParticipantDTO {
      assists: number;
      baronKills: number;
      bountyLevel: number;
      champExperience: number;
      champLevel: number;
      championId: number;
      championName: string;
      championTransform: number;
      consumablesPurchased: number;
      damageDealtToBuildings: number;
      damageDealtToObjectives: number;
      damageDealtToTurrets: number;
      damageSelfMitigated: number;
      deaths: number;
      detectorWardsPlaced: number;
      doubleKills: number;
      dragonKills: number;
      firstBloodAssist: boolean;
      firstBloodKill: boolean;
      firstTowerAssist: boolean;
      firstTowerKill: boolean;
      gameEndedInEarlySurrender: boolean;
      gameEndedInSurrender: boolean;
      goldEarned: number;
      goldSpent: number;
      individualPosition: string;
      inhibitorKills: number;
      inhibitorTakedowns: number;
      inhibitorsLost: number;
      item0: number;
      item1: number;
      item2: number;
      item3: number;
      item4: number;
      item5: number;
      item6: number;
      itemsPurchased: number;
      killingSprees: number;
      kills: number;
      lane: string;
      largestCriticalStrike: number;
      largestKillingSpree: number;
      largestMultiKill: number;
      longestTimeSpentLiving: number;
      magicDamageDealt: number;
      magicDamageDealtToChampions: number;
      magicDamageTaken: number;
      neutralMinionsKilled: number;
      nexusKills: number;
      nexusLost: number;
      nexusTakedowns: number;
      objectivesStolen: number;
      objectivesStolenAssists: number;
      participantId: number;
      pentaKills: number;
      perks: PerksDTO;
      physicalDamageDealt: number;
      physicalDamageDealtToChampions: number;
      physicalDamageTaken: number;
      profileIcon: number;
      puuid: string;
      quadraKills: number;
      riotIdName: string;
      riotIdTagline: string;
      role: string;
      sightWardsBoughtInGame: number;
      spell1Casts: number;
      spell2Casts: number;
      spell3Casts: number;
      spell4Casts: number;
      summoner1Casts: number;
      summoner1Id: number;
      summoner2Casts: number;
      summoner2Id: number;
      summonerId: string;
      summonerLevel: number;
      summonerName: string;
      teamEarlySurrendered: boolean;
      teamId: number;
      teamPosition: string;
      timeCCingOthers: number;
      timePlayed: number;
      totalDamageDealt: number;
      totalDamageDealtToChampions: number;
      totalDamageShieldedOnTeammates: number;
      totalDamageTaken: number;
      totalHeal: number;
      totalHealsOnTeammates: number;
      totalMinionsKilled: number;
      totalTimeCCDealt: number;
      totalTimeSpentDead: number;
      totalUnitsHealed: number;
      tripleKills: number;
      trueDamageDealt: number;
      trueDamageDealtToChampions: number;
      trueDamageTaken: number;
      turretKills: number;
      turretTakedowns: number;
      turretsLost: number;
      unrealKills: number;
      visionScore: number;
      visionWardsBoughtInGame: number;
      wardsKilled: number;
      wardsPlaced: number;
      win: boolean;
    }

    export interface ObjectivesStatsDTO {
      first: boolean;
      kills: number;
    }
    export interface ObjectivesDTO {
      baron: ObjectivesStatsDTO;
      champion: ObjectivesStatsDTO;
      dragon: ObjectivesStatsDTO;
      inhibitor: ObjectivesStatsDTO;
      riftHerald: ObjectivesStatsDTO;
      tower: ObjectivesStatsDTO;
    }

    export interface BanDTO {
      championId: number;
      pickTurn: number;
    }

    export interface TeamDTO {
      bans: BanDTO[];
      objectives: ObjectivesDTO;
      teamId: number;
      win: boolean;
    }

    export interface MatchInfoDTO {
      gameCreation: number;
      gameDuration: number;
      gameId: number;
      gameMode: string;
      gameName: string;
      gameStartTimestamp: number;
      gameType: string;
      gameVersion: string;
      mapId: number;
      participants: ParticipantDTO[];
      platformId: string;
      queueId: number;
      teams: TeamDTO[];
      tournamentCode: string;
    }

    export interface MetadataDTO {
      dataVersion: string;
      matchId: string;
      participants: string[];
    }

    export interface MatchDTO {
      metadata: MetadataDTO;
      info: MatchInfoDTO;
    }

    export interface MatchTimelineParticipantDTO {
      participantId: number;
      puuid: string;
    }

    export interface PositionDTO {
      x: number;
      y: number;
    }

    export interface ParticipantFrameDTO {
      championStats: { [key: string]: number };
      currentGold: number;
      damageStats: { [key: string]: number };
      goldPerSecond: number;
      jungleMinionsKilled: number;
      level: number;
      minionsKilled: number;
      participantId: number;
      position: PositionDTO;
      timeEnemySpentControlled: number;
      totalGold: number;
      xp: number;
    }

    export interface VictimDamageDTO {
      basic: boolean;
      magicDamage: number;
      name: string;
      participantId: number;
      physicalDamage: number;
      spellName: string;
      spellSlot: number;
      trueDamage: number;
      type: string;
    }

    export interface EventDTO {
      realTimestamp?: number;
      timestamp: number;
      type: string;
      itemId?: number;
      participantId?: number;
      levelUpType?: string;
      skillSlot?: number;
      creatorId?: number;
      wardType?: string;
      level?: number;
      bounty?: number;
      killStreakLength?: number;
      killerId?: number;
      position?: PositionDTO;
      victimDamageDealt?: string[];
      victimDamageReceived?: string[];
      victimId?: number;
      killType?: string;
      afterId?: number;
      beforeId?: number;
      goldGain?: number;
      assistingParticipantIds?: number[];
      laneType?: string;
      teamId?: number;
      killerTeamId?: number;
      monsterSubType?: string;
      monsterType?: string;
      buildingType?: string;
      towerType?: string;
      transformType?: string;
      multiKillLength?: number;
      gameId?: number;
      winningTeam?: number;
    }

    export interface FrameDTO {
      events: EventDTO[];
      participantFrames: { [key: string]: ParticipantFrameDTO };
      timestamp: number;
    }

    export interface MatchTimelineInfoDTO {
      frameInterval: number;
      frames: FrameDTO[];
      gameId: number;
      participants: MatchTimelineParticipantDTO[];
    }

    export interface MatchTimelineDTO {
      metadata: MetadataDTO;
      info: MatchTimelineInfoDTO;
    }
  }

  export namespace Spectator {
    export interface CurrentGameInfoDTO {
      /** The ID of the game */
      gameId: number;
      /** The game type */
      gameType: string;
      /** The game start time represented in epoch milliseconds */
      gameStartTime: number;
      /** The ID of the map */
      mapId: number;
      /** The amount of time in seconds that has passed since the game started */
      gameLength: number;
      /** The ID of the platform on which the game is being played */
      platformId: string;
      /** The game mode */
      gameMode: string;
      /** Banned champion information */
      bannedChampions: Spectator.BannedChampionDTO[];
      /** The queue type (queue types are documented on the Game Constants page) */
      gameQueueConfigId?: number | null;
      /** The observer information */
      observers: Spectator.ObserverDTO;
      /** The participant information */
      participants: Spectator.CurrentGameParticipantDTO[];
    }

    export interface BannedChampionDTO {
      /** The turn during which the champion was banned */
      pickTurn: number;
      /** The ID of the banned champion */
      championId: number;
      /** The ID of the team that banned the champion */
      teamId: number;
    }

    export interface ObserverDTO {
      /** Key used to decrypt the spectator grid game data for playback */
      encryptionKey: string;
    }

    export interface CurrentGameParticipantDTO {
      /** The ID of the champion played by this participant */
      championId: number;
      /** Perks/Runes Reforged Information */
      perks: Spectator.PerksDTO;
      /** The ID of the profile icon used by this participant */
      profileIconId: number;
      /** Flag indicating whether or not this participant is a bot */
      bot: boolean;
      /** The team ID of this participant, indicating the participant's team */
      teamId: number;
      /** The summoner name of this participant */
      summonerName: string;
      /** The encrypted summoner ID of this participant */
      summonerId: string;
      /** The ID of the first summoner spell used by this participant */
      spell1Id: number;
      /** The ID of the second summoner spell used by this participant */
      spell2Id: number;
      /** List of Game Customizations */
      gameCustomizationObjects: Spectator.GameCustomizationObjectDTO[];
    }

    export interface PerksDTO {
      /** IDs of the perks/runes assigned. */
      perkIds: number[];
      /** Primary runes path */
      perkStyle: number;
      /** Secondary runes path */
      perkSubStyle: number;
    }

    export interface GameCustomizationObjectDTO {
      /** Category identifier for Game Customization */
      category: string;
      /** Game Customization content */
      content: string;
    }

    export interface FeaturedGamesDTO {
      /** The list of featured games */
      gameList: Spectator.FeaturedGameInfoDTO[];
      /** The suggested interval to wait before requesting FeaturedGames again */
      clientRefreshInterval: number;
    }

    export interface FeaturedGameInfoDTO {
      /** The game mode
       (Legal values:  CLASSIC,  ODIN,  ARAM,  TUTORIAL,  ONEFORALL,  ASCENSION,  FIRSTBLOOD,  KINGPORO) */
      gameMode:
        | "CLASSIC"
        | "ODIN"
        | "ARAM"
        | "TUTORIAL"
        | "ONEFORALL"
        | "ASCENSION"
        | "FIRSTBLOOD"
        | "KINGPORO";
      /** The amount of time in seconds that has passed since the game started */
      gameLength: number;
      /** The ID of the map */
      mapId: number;
      /** The game type
       (Legal values:  CUSTOM_GAME,  MATCHED_GAME,  TUTORIAL_GAME) */
      gameType: "CUSTOM_GAME" | "MATCHED_GAME" | "TUTORIAL_GAME";
      /** Banned champion information */
      bannedChampions: Spectator.BannedChampionDTO[];
      /** The ID of the game */
      gameId: number;
      /** The observer information */
      observers: Spectator.ObserverDTO;
      /** The queue type (queue types are documented on the Game Constants page) */
      gameQueueConfigId: number;
      /** The game start time represented in epoch milliseconds */
      gameStartTime: number;
      /** The participant information */
      participants: Spectator.ParticipantDTO[];
      /** The ID of the platform on which the game is being played */
      platformId: string;
    }

    export interface ParticipantDTO {
      /** Flag indicating whether or not this participant is a bot */
      bot: boolean;
      /** The ID of the second summoner spell used by this participant */
      spell2Id: number;
      /** The ID of the profile icon used by this participant */
      profileIconId: number;
      /** The summoner name of this participant */
      summonerName: string;
      /** The ID of the champion played by this participant */
      championId: number;
      /** The team ID of this participant, indicating the participant's team */
      teamId: number;
      /** The ID of the first summoner spell used by this participant */
      spell1Id: number;
    }
  }

  export namespace Summoner {
    export interface SummonerDTO {
      profileIconId: number;
      name: string;
      puuid: string;
      summonerLevel: number;
      revisionDate: number;
      id: string;
      accountId: string;
    }
  }

  export namespace TftLeague {
    export interface LeagueListDTO {
      leagueId: string;
      entries: TftLeague.LeagueItemDTO[];
      tier: string;
      name: string;
      queue: string;
    }

    export interface LeagueItemDTO {
      freshBlood: boolean;
      /** First placement. */
      wins: number;
      summonerName: string;
      miniSeries?: TftLeague.MiniSeriesDTO | null;
      inactive: boolean;
      veteran: boolean;
      hotStreak: boolean;
      rank: string;
      leaguePoints: number;
      /** Second through eighth placement. */
      losses: number;
      /** Player's encrypted summonerId. */
      summonerId: string;
    }

    export interface MiniSeriesDTO {
      losses: number;
      progress: string;
      target: number;
      wins: number;
    }

    export interface LeagueEntryDTO {
      leagueId: string;
      /** Player's encrypted summonerId. */
      summonerId: string;
      summonerName: string;
      queueType: string;
      tier: string;
      rank: string;
      leaguePoints: number;
      /** First placement. */
      wins: number;
      /** Second through eighth placement. */
      losses: number;
      hotStreak: boolean;
      veteran: boolean;
      freshBlood: boolean;
      inactive: boolean;
      miniSeries?: TftLeague.MiniSeriesDTO | null;
    }
  }

  export namespace TftMatch {
    export interface MatchDTO {
      /** Match metadata. */
      metadata: TftMatch.MetadataDTO;
      /** Match info. */
      info: TftMatch.InfoDTO;
    }

    export interface MetadataDTO {
      /** Match data version. */
      data_version: string;
      /** Match id. */
      match_id: string;
      /** A list of encrypted participant PUUIDs. */
      participants: string[];
    }

    export interface InfoDTO {
      /** Unix timestamp. */
      game_datetime: number;
      /** Game length in seconds. */
      game_length: number;
      /** Game variation key. Game variations documented in TFT static data. */
      game_variation?: string | null;
      /** Game client version. */
      game_version: string;
      /** Participants. */
      participants: TftMatch.ParticipantDTO[];
      /** Please refer to the League of Legends documentation. */
      queue_id: number;
      /** Teamfight Tactics set number. */
      tft_set_number: number;
    }

    export interface ParticipantDTO {
      /** Participant's companion. */
      companion: TftMatch.CompanionDTO;
      /** Gold left after participant was eliminated. */
      gold_left: number;
      /** The round the participant was eliminated in. Note: If the player was eliminated in stage 2-1 their last_round would be 5. */
      last_round: number;
      /** Participant Little Legend level. Note: This is not the number of active units. */
      level: number;
      /** Participant placement upon elimination. */
      placement: number;
      /** Number of players the participant eliminated. */
      players_eliminated: number;
      /** Encrypted PUUID. */
      puuid: string;
      /** The number of seconds before the participant was eliminated. */
      time_eliminated: number;
      /** Damage the participant dealt to other players. */
      total_damage_to_players: number;
      /** A complete list of traits for the participant's active units. */
      traits: TftMatch.TraitDTO[];
      /** A list of active units for the participant. */
      units: TftMatch.UnitDTO[];
    }

    export interface TraitDTO {
      /** Trait name. */
      name: string;
      /** Number of units with this trait. */
      num_units: number;
      /** Current style for this trait. (0 = No style, 1 = Bronze, 2 = Silver, 3 = Gold, 4 = Chromatic) */
      style?: number | null;
      /** Current active tier for the trait. */
      tier_current: number;
      /** Total tiers for the trait. */
      tier_total?: number | null;
    }

    export interface UnitDTO {
      /** A list of the unit's items. Please refer to the Teamfight Tactics documentation for item ids. */
      items: number[];
      /** This field was introduced in patch 9.22 with data_version 2. */
      character_id: string;
      /** Unit name. */
      name: string;
      /** Unit rarity. This doesn't equate to the unit cost. */
      rarity: number;
      /** Unit tier. */
      tier: number;
    }

    export interface CompanionDTO {
      skin_ID: number;
      content_ID: string;
      species: string;
    }
  }

  export namespace TftSummoner {
    export interface SummonerDTO {
      /** Encrypted account ID. Max length 56 characters. */
      accountId: string;
      /** ID of the summoner icon associated with the summoner. */
      profileIconId: number;
      /** Date summoner was last modified specified as epoch milliseconds. The following events will update this timestamp: summoner name change, summoner level change, or profile icon change. */
      revisionDate: number;
      /** Summoner name. */
      name: string;
      /** Encrypted summoner ID. Max length 63 characters. */
      id: string;
      /** Encrypted PUUID. Exact length of 78 characters. */
      puuid: string;
      /** Summoner level associated with the summoner. */
      summonerLevel: number;
    }
  }

  export namespace Tournament {
    export enum REGION {
      BR = "BR",
      EUNE = "EUNE",
      EUW = "EUW",
      JP = "JP",
      LAN = "LAN",
      LAS = "LAS",
      NA = "NA",
      OCE = "OCE",
      PBE = "PBE",
      RU = "RU",
      TR = "TR",
    }

    export enum PICKTYPE {
      BLIND_PICK = "BLIND_PICK",
      DRAFT_MODE = "DRAFT_MODE",
      ALL_RANDOM = "ALL_RANDOM",
      TOURNAMENT_DRAFT = "TOURNAMENT_DRAFT",
    }

    export enum MAPTYPE {
      SUMMONERS_RIFT = "SUMMONERS_RIFT",
      TWISTED_TREELINE = "TWISTED_TREELINE",
      HOWLING_ABYSS = "HOWLING_ABYSS",
    }

    export enum SPECTATORTYPE {
      NONE = "NONE",
      LOBBYONLY = "LOBBYONLY",
      ALL = "ALL",
    }

    export interface TournamentCodeParametersDTO {
      /** Optional list of encrypted summonerIds in order to validate the players eligible to join the lobby. NOTE: We currently do not enforce participants at the team level, but rather the aggregate of teamOne and teamTwo. We may add the ability to enforce at the team level in the future. */
      allowedSummonerIds?: string[] | null;
      /** Optional string that may contain any data in any format, if specified at all. Used to denote any custom information about the game. */
      metadata?: string | null;
      /** The team size of the game. Valid values are 1-5. */
      teamSize: number;
      /** The pick type of the game.
           (Legal values:  BLIND_PICK,  DRAFT_MODE,  ALL_RANDOM,  TOURNAMENT_DRAFT) */
      pickType: PICKTYPE;
      /** The map type of the game.
           (Legal values:  SUMMONERS_RIFT,  TWISTED_TREELINE,  HOWLING_ABYSS) */
      mapType: MAPTYPE;
      /** The spectator type of the game.
           (Legal values:  NONE,  LOBBYONLY,  ALL) */
      spectatorType: SPECTATORTYPE;
    }

    export interface LobbyEventDTO {
      /** The summonerId that triggered the event (Encrypted) */
      summonerId: string;
      /** The type of event that was triggered */
      eventType: string;
      /** Timestamp from the event */
      timestamp: string;
    }

    export interface ProviderRegistrationParametersDTO {
      /** The region in which the provider will be running tournaments.
           (Legal values:  BR,  EUNE,  EUW,  JP,  LAN,  LAS,  NA,  OCE,  PBE,  RU,  TR) */
      region: REGION;
      /** The provider's callback URL to which tournament game results in this region should be posted. The URL must be well-formed, use the http or https protocol, and use the default port for the protocol (http URLs must use port 80, https URLs must use port 443). */
      url: string;
    }

    export interface TournamentRegistrationParametersDTO {
      /** The provider ID to specify the regional registered provider data to associate this tournament. */
      providerId: number;
      /** The optional name of the tournament. */
      name?: string | null;
    }

    export interface ProviderRegistrationParametersDTO {
      /** The region in which the provider will be running tournaments.
           (Legal values:  BR,  EUNE,  EUW,  JP,  LAN,  LAS,  NA,  OCE,  PBE,  RU,  TR) */
      region: REGION;
      /** The provider's callback URL to which tournament game results in this region should be posted. The URL must be well-formed, use the http or https protocol, and use the default port for the protocol (http URLs must use port 80, https URLs must use port 443). */
      url: string;
    }

    export interface TournamentCodeDTO {
      /** The tournament code. */
      code: string;
      /** The spectator mode for the tournament code game. */
      spectators: string;
      /** The lobby name for the tournament code game. */
      lobbyName: string;
      /** The metadata for tournament code. */
      metaData: string;
      /** The password for the tournament code game. */
      password: string;
      /** The team size for the tournament code game. */
      teamSize: number;
      /** The provider's ID. */
      providerId: number;
      /** The pick mode for tournament code game. */
      pickType: string;
      /** The tournament's ID. */
      tournamentId: number;
      /** The tournament code's ID. */
      id: number;
      /** The tournament code's region.
           (Legal values:  BR,  EUNE,  EUW,  JP,  LAN,  LAS,  NA,  OCE,  PBE,  RU,  TR) */
      region: REGION;
      /** The game map for the tournament code game */
      map: string;
      /** The summonerIds of the participants (Encrypted) */
      participants: string[];
    }

    export interface TournamentCodeUpdateParametersDTO {
      /** Optional list of encrypted summonerIds in order to validate the players eligible to join the lobby. NOTE: We currently do not enforce participants at the team level, but rather the aggregate of teamOne and teamTwo. We may add the ability to enforce at the team level in the future. */
      allowedSummonerIds?: string[] | null;
      /** The pick type
           (Legal values:  BLIND_PICK,  DRAFT_MODE,  ALL_RANDOM,  TOURNAMENT_DRAFT) */
      pickType: PICKTYPE;
      /** The map type
           (Legal values:  SUMMONERS_RIFT,  TWISTED_TREELINE,  HOWLING_ABYSS) */
      mapType: MAPTYPE;
      /** The spectator type
           (Legal values:  NONE,  LOBBYONLY,  ALL) */
      spectatorType: SPECTATORTYPE;
    }

    export interface LobbyEventDTOWrapper {
      eventList: Tournament.LobbyEventDTO[];
    }

    export interface LobbyEventDTO {
      /** Timestamp from the event */
      timestamp: string;
      /** The type of event that was triggered */
      eventType: string;
      /** The summonerId that triggered the event (Encrypted) */
      summonerId: string;
    }
  }

  export namespace ValContent {
    export interface ContentItemDTO {
      name: string;
      /** This field is excluded from the response when a locale is set */
      localizedNames?: ValContent.LocalizedNamesDTO | null;
      id: string;
      assetName: string;
      /** This field is only included for maps and game modes. These values are used in the match response */
      assetPath?: string | null;
    }

    export interface LocalizedNamesDTO {
      "ar-AE": string;
      "de-DE": string;
      "en-GB": string;
      "en-US": string;
      "es-ES": string;
      "es-MX": string;
      "fr-FR": string;
      "id-ID": string;
      "it-IT": string;
      "ja-JP": string;
      "ko-KR": string;
      "pl-PL": string;
      "pt-BR": string;
      "ru-RU": string;
      "th-TH": string;
      "tr-TR": string;
      "vi-VN": string;
      "zh-CN": string;
      "zh-TW": string;
    }
  }

  export namespace ValMatch {
    export interface MatchDTO {
      matchInfo: ValMatch.MatchInfoDTO;
      players: ValMatch.PlayerDTO[];
      teams: ValMatch.TeamDTO[];
      roundResults: ValMatch.RoundResultDTO[];
    }

    export interface MatchInfoDTO {
      matchId: string;
      mapId: string;
      gameLengthMillis: number;
      gameStartMillis: number;
      provisioningFlowId: string;
      isCompleted: boolean;
      customGameName: string;
      queueId: string;
      gameMode: string;
      isRanked: boolean;
      seasonId: string;
    }

    export interface PlayerDTO {
      puuid: string;
      teamId: string;
      partyId: string;
      characterId: string;
      stats: ValMatch.PlayerStatsDTO;
      competitiveTier: number;
      playerCard: string;
      playerTitle: string;
    }

    export interface PlayerStatsDTO {
      score: number;
      roundsPlayed: number;
      kills: number;
      deaths: number;
      assists: number;
      playtimeMillis: number;
      abilityCasts: ValMatch.AbilityCastsDTO;
    }

    export interface AbilityCastsDTO {
      grenadeCasts: number;
      ability1Casts: number;
      ability2Casts: number;
      ultimateCasts: number;
    }

    export interface TeamDTO {
      /** This is an arbitrary string. Red and Blue in bomb modes. The puuid of the player in deathmatch. */
      teamId: string;
      won: boolean;
      roundsPlayed: number;
      roundsWon: number;
      /** Team points scored. Number of kills in deathmatch. */
      numPoints: number;
    }

    export interface RoundResultDTO {
      roundNum: number;
      roundResult: string;
      roundCeremony: string;
      winningTeam: string;
      /** PUUID of player */
      bombPlanter: string;
      /** PUUID of player */
      bombDefuser: string;
      plantRoundTime: number;
      plantPlayerLocations: ValMatch.PlayerLocationsDTO[];
      plantLocation: ValMatch.LocationDTO;
      plantSite: string;
      defuseRoundTime: number;
      defusePlayerLocations: ValMatch.PlayerLocationsDTO[];
      defuseLocation: ValMatch.LocationDTO;
      playerStats: ValMatch.PlayerRoundStatsDTO[];
      roundResultCode: string;
    }

    export interface PlayerLocationsDTO {
      puuid: string;
      viewRadians: number;
      location: ValMatch.LocationDTO;
    }

    export interface LocationDTO {
      x: number;
      y: number;
    }

    export interface PlayerRoundStatsDTO {
      puuid: string;
      kills: ValMatch.KillDTO[];
      damage: ValMatch.DamageDTO[];
      score: number;
      economy: ValMatch.EconomyDTO;
      ability: ValMatch.AbilityDTO;
    }

    export interface KillDTO {
      gameTime?: number | null;
      roundTime?: number | null;
      timeSinceGameStartMillis?: number | null;
      timeSinceRoundStartMillis?: number | null;
      /** PUUID */
      killer: string;
      /** PUUID */
      victim: string;
      victimLocation: ValMatch.LocationDTO;
      /** List of PUUIDs */
      assistants: string[];
      playerLocations: ValMatch.PlayerLocationsDTO[];
      finishingDamage: ValMatch.FinishingDamageDTO;
    }

    export interface FinishingDamageDTO {
      damageType: string;
      damageItem: string;
      isSecondaryFireMode: boolean;
    }

    export interface DamageDTO {
      /** PUUID */
      receiver: string;
      damage: number;
      legshots: number;
      bodyshots: number;
      headshots: number;
    }

    export interface EconomyDTO {
      loadoutValue: number;
      weapon: string;
      armor: string;
      remaining: number;
      spent: number;
    }

    export interface AbilityDTO {
      grenadeEffects: string;
      ability1Effects: string;
      ability2Effects: string;
      ultimateEffects: string;
    }

    export interface MatchlistDTO {
      puuid: string;
      history: ValMatch.MatchlistEntryDTO[];
    }

    export interface MatchlistEntryDTO {
      matchId: string;
      gameStartTimeMillis: number;
      teamId: string;
    }

    export interface RecentMatchesDTO {
      currentTime: number;
      matchIds: string[];
    }
  }

  export namespace DDragon {
    export enum REALM {
      NA = "na",
      EUW = "euw",
      EUNE = "EUNE",
      BR = "br",
      JP = "jp",
      KR = "kr",
      OCE = "oce",
      LAN = "lan",
      LAS = "las",
      RU = "ru",
      TR = "tr",
    }

    export enum LOCALE {
      cs_CZ = "cs_CZ", // Czech (Czech Republic)
      el_GR = "el_GR", // Greek (Greece)
      pl_PL = "pl_PL", // Polish (Poland)
      ro_RO = "ro_RO", // Romanian (Romania)
      hu_HU = "hu_HU", // Hungarian (Hungary)
      en_GB = "en_GB", // English (United Kingdom)
      de_DE = "de_DE", // German (Germany)
      es_ES = "es_ES", // Spanish (Spain)
      it_IT = "it_IT", // Italian (Italy)
      fr_FR = "fr_FR", // French (France)
      ja_JP = "ja_JP", // Japanese (Japan)
      ko_KR = "ko_KR", // Korean (Korea)
      es_MX = "es_MX", // Spanish (Mexico)
      es_AR = "es_AR", // Spanish (Argentina)
      pt_BR = "pt_BR", // Portuguese (Brazil)
      en_US = "en_US", // English (United States)
      en_AU = "en_AU", // English (Australia)
      ru_RU = "ru_RU", // Russian (Russia)
      tr_TR = "tr_TR", // Turkish (Turkey)
      ms_MY = "ms_MY", // Malay (Malaysia)
      en_PH = "en_PH", // English (Republic of the Philippines)
      en_SG = "en_SG", // English (Singapore)
      th_TH = "th_TH", // Thai (Thailand)
      vn_VN = "vn_VN", // Vietnamese (Viet Nam)
      id_ID = "id_ID", // Indonesian (Indonesia)
      zh_MY = "zh_MY", // Chinese (Malaysia)
      zh_CN = "zh_CN", // Chinese (China)
      zh_TW = "zh_TW", // Chinese (Taiwan)
    }

    interface DDragonWrapper {
      type: string;
      format?: string;
      version: string;
    }

    interface DDragonDataWrapper<T> extends DDragonWrapper {
      data: { [key: string]: T };
    }
    export interface DDragonImageDTO {
      id?: number; // Only really used for the ProfileIcon. Should we create an entire interface just for that or leave it here as an optional?
      image: {
        full: string;
        sprite: string;
        group: string;
        x: number;
        y: number;
        w: number;
        h: number;
      };
    }

    export interface DDragonMapDTO
      extends DDragonDataWrapper<DDragonMapDataDTO> {}

    export interface DDragonMapDataDTO {
      MapName: string;
      MapId: string;
      image: DDragonImageDTO;
    }

    export interface DDragonProfileIconDTO
      extends DDragonDataWrapper<DDragonImageDTO> {}

    export interface DDragonSummonerSpellDTO
      extends DDragonDataWrapper<DDragonSummonerSpellDataDTO> {}

    interface DDragonSpellWrapper {
      id: string;
      name: string;
      description: string;
      tooltip: string;
      maxrank: number;
      cooldown: number[];
      cooldownBurn: string;
      cost: number[];
      datavalues: {};
      effect: number[][];
      effectBurn: string[];
      vars: {
        link: string;
        coeff: number;
        key: string;
      }[];
      costType: string;
      maxammo: string;
      range: number[];
      rangeBurn: string;
      image: DDragonImageDTO;
      resource: string;
    }
    export interface DDragonChampionSpellDTO extends DDragonSpellWrapper {
      costBurn: string[];
      leveltip: {
        label: string[];
        effect: string[];
      };
    }
    export interface DDragonSummonerSpellDataDTO extends DDragonSpellWrapper {
      costBurn: string;
      key: string;
      summonerLevel: number;
      modes: string[];
    }

    export interface DDragonRealmsDTO {
      n: {
        item: string;
        rune: string;
        mastery: string;
        summoner: string;
        champion: string;
        profileicon: string;
        map: string;
        language: string;
        sticker: string;
      };
      v: string;
      l: string;
      cdn: string;
      dd: string;
      lg: string;
      css: string;
      profileiconmax: number;
      store: null; // This is just null on every server I checked. Always exists, but always null.
    }

    export interface DDragonRunesReforgedDTO {
      id: number;
      key: string;
      icon: string;
      name: string;
      slots: DDragonRunesReforgedSlotDTO[];
    }
    export interface DDragonRunesReforgedSlotDTO {
      runes: DDragonRunesReforgedRuneDTO[];
    }
    export interface DDragonRunesReforgedRuneDTO {
      id: number;
      key: string;
      icon: string;
      name: string;
      shortDesc: string;
      longDesc: string;
    }

    export interface DDragonItemWrapperDTO
      extends DDragonDataWrapper<DDragonItemDTO> {
      basic: DDragonItemDTO;
      groups: {
        id: string;
        MaxGroupOwnable: string;
      }[];
      tree: {
        header: string;
        tags: string[];
      }[];
    }
    export interface DDragonItemDTO {
      name: string;
      rune: {
        isrune: boolean;
        tier: number;
        type: string;
      };
      gold: {
        base: number;
        total: number;
        sell: number;
        purchasable: boolean;
      };
      group: string;
      description: string;
      colloq: string;
      plaintext: string;
      consumed: boolean;
      stacks: number;
      depth: number;
      consumeOnFull: boolean;
      from: string[];
      into: string[];
      image: DDragonImageDTO;
      specialRecipe: number;
      inStore: boolean;
      hideFromAll: boolean;
      requiredChampion: string;
      requiredAlly: string;
      stats: {
        FlatHPPoolMod?: number;
        rFlatHPModPerLevel?: number;
        FlatMPPoolMod?: number;
        rFlatMPModPerLevel?: number;
        PercentHPPoolMod?: number;
        PercentMPPoolMod?: number;
        FlatHPRegenMod?: number;
        rFlatHPRegenModPerLevel?: number;
        PercentHPRegenMod?: number;
        FlatMPRegenMod?: number;
        rFlatMPRegenModPerLevel?: number;
        PercentMPRegenMod?: number;
        FlatArmorMod?: number;
        rFlatArmorModPerLevel?: number;
        PercentArmorMod?: number;
        rFlatArmorPenetrationMod?: number;
        rFlatArmorPenetrationModPerLevel?: number;
        rPercentArmorPenetrationMod?: number;
        rPercentArmorPenetrationModPerLevel?: number;
        FlatPhysicalDamageMod?: number;
        rFlatPhysicalDamageModPerLevel?: number;
        PercentPhysicalDamageMod?: number;
        FlatMagicDamageMod?: number;
        rFlatMagicDamageModPerLevel?: number;
        PercentMagicDamageMod?: number;
        FlatMovementSpeedMod?: number;
        rFlatMovementSpeedModPerLevel?: number;
        PercentMovementSpeedMod?: number;
        rPercentMovementSpeedModPerLevel?: number;
        FlatAttackSpeedMod?: number;
        PercentAttackSpeedMod?: number;
        rPercentAttackSpeedModPerLevel?: number;
        rFlatDodgeMod?: number;
        rFlatDodgeModPerLevel?: number;
        PercentDodgeMod?: number;
        FlatCritChanceMod?: number;
        rFlatCritChanceModPerLevel?: number;
        PercentCritChanceMod?: number;
        FlatCritDamageMod?: number;
        rFlatCritDamageModPerLevel?: number;
        PercentCritDamageMod?: number;
        FlatBlockMod?: number;
        PercentBlockMod?: number;
        FlatSpellBlockMod?: number;
        rFlatSpellBlockModPerLevel?: number;
        PercentSpellBlockMod?: number;
        FlatEXPBonus?: number;
        PercentEXPBonus?: number;
        rPercentCooldownMod?: number;
        rPercentCooldownModPerLevel?: number;
        rFlatTimeDeadMod?: number;
        rFlatTimeDeadModPerLevel?: number;
        rPercentTimeDeadMod?: number;
        rPercentTimeDeadModPerLevel?: number;
        rFlatGoldPer10Mod?: number;
        rFlatMagicPenetrationMod?: number;
        rFlatMagicPenetrationModPerLevel?: number;
        rPercentMagicPenetrationMod?: number;
        rPercentMagicPenetrationModPerLevel?: number;
        FlatEnergyRegenMod?: number;
        rFlatEnergyRegenModPerLevel?: number;
        FlatEnergyPoolMod?: number;
        rFlatEnergyModPerLevel?: number;
        PercentLifeStealMod?: number;
        PercentSpellVampMod?: number;
      };
      tags: string[];
      maps: { [key: string]: boolean };
      effect?: { [key: string]: string };
    }

    export interface DDragonChampionInfoDTO {
      attack: number;
      defense: number;
      magic: number;
      difficulty: number;
    }
    export interface DDragonChampionStatsDTO {
      hp: number;
      hpperlevel: number;
      mp: number;
      mpperlevel: number;
      movespeed: number;
      armor: number;
      armorperlevel: number;
      spellblock: number;
      spellblockperlevel: number;
      attackrange: number;
      hpregen: number;
      hpregenperlevel: number;
      mpregen: number;
      mpregenperlevel: number;
      crit: number;
      critperlevel: number;
      attackdamage: number;
      attackdamageperlevel: number;
      attackspeedperlevel: number;
      attackspeed: number;
    }
    export interface DDragonChampionListDTO
      extends DDragonDataWrapper<DDragonChampionListDataDTO> {}
    export interface DDragonChampionListDataDTO {
      version: string;
      id: string;
      key: string;
      name: string;
      title: string;
      blurb: string;
      info: DDragonChampionInfoDTO;
      image: DDragonImageDTO;
      tags: string[];
      partype: string;
      stats: DDragonChampionStatsDTO;
    }
    export interface DDragonChampionDTO
      extends DDragonDataWrapper<DDragonChampionDataDTO> {}
    interface DDragonSpellWrapper {
      id: string;
      name: string;
      description: string;
      tooltip: string;
      maxrank: number;
      cooldown: number[];
      cooldownBurn: string;
      cost: number[];
      datavalues: {};
      effect: number[][];
      effectBurn: string[];
      vars: {
        link: string;
        coeff: number;
        key: string;
      }[];
      costType: string;
      maxammo: string;
      range: number[];
      rangeBurn: string;
      image: DDragonImageDTO;
      resource: string;
    }
    export interface DDragonChampionSpellDTO extends DDragonSpellWrapper {
      costBurn: string[];
      leveltip: {
        label: string[];
        effect: string[];
      };
    }
    export interface DDragonChampionDataDTO {
      id: string;
      key: string;
      name: string;
      title: string;
      image: DDragonImageDTO;
      skins: {
        id: string;
        num: number;
        name: string;
        chromas: boolean;
      }[];
      lore: string;
      blurb: string;
      allytips: string[];
      enemytips: string[];
      tags: string[];
      partype: string;
      info: DDragonChampionInfoDTO;
      stats: DDragonChampionStatsDTO;
      spells: DDragonChampionSpellDTO[];
      passive: {
        name: string;
        description: string;
        image: DDragonImageDTO;
      };
      recommended: {
        champion?: string;
        title?: string;
        map?: string;
        mode?: string;
        type: string;
        customTag: string;
        requiredPerk: string;
        sortrank: string;
        extensionPage: boolean;
        customPanel: string;
        customPanelCurrencyType?: string;
        customPanelBuffCurrencyName?: string;
        blocks: {
          type: string;
          recMath: boolean;
          recSteps?: boolean;
          minSummonerLevel: number;
          maxSummonerLevel: number;
          showIfSummonerSpell: string;
          hideIfSummonerSpell: string;
          appendAfterSection?: string;
          visibleWithAllOf?: string[];
          hiddenWithAnyOf?: string[];
          items: {
            id: string;
            count: number;
            hideCount: boolean;
          }[];
        }[];
      }[];
    }
  }
}
