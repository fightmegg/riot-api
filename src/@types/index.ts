import { PlatformId } from "@fightmegg/riot-rate-limiter";
import { RedisOptions } from "ioredis";

export type Leaves<T> = T extends object
  ? {
      [K in keyof T]: `${Exclude<K, symbol>}${Leaves<T[K]> extends never
        ? ""
        : `.${Leaves<T[K]>}`}`;
    }[keyof T]
  : never;

export namespace RiotAPITypes {
  export interface Config {
    debug?: boolean;
    cache?: {
      cacheType: "local" | "ioredis";
      client?: RedisOptions | string;
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
    EMERALD = "EMERALD",
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
    TOURNAMENTMODE = "tournamentmode",
    DEATHMATCH = "deathmatch",
    ONEFA = "onefa",
    GGTEAM = "ggteam",
  }

  export type VALCluster =
    | PlatformId.AP
    | PlatformId.BR
    | PlatformId.EU
    | PlatformId.KR
    | PlatformId.LATAM
    | PlatformId.NA
    | PlatformId.ESPORTS;

  export type LORCluster =
    | PlatformId.AMERICAS
    | PlatformId.ASIA
    | PlatformId.EUROPE
    | PlatformId.SEA
    | PlatformId.APAC;

  export type TFTCluster =
    | PlatformId.AMERICAS
    | PlatformId.ASIA
    | PlatformId.EUROPE
    | PlatformId.SEA;

  export type Cluster =
    | PlatformId.EUROPE
    | PlatformId.AMERICAS
    | PlatformId.ASIA
    | PlatformId.SEA
    | PlatformId.ESPORTS;

  export type LoLRegion =
    | PlatformId.BR1
    | PlatformId.EUNE1
    | PlatformId.EUW1
    | PlatformId.JP1
    | PlatformId.KR
    | PlatformId.LA1
    | PlatformId.LA2
    | PlatformId.NA1
    | PlatformId.ME1
    | PlatformId.OC1
    | PlatformId.RU
    | PlatformId.TR1
    | PlatformId.PH2
    | PlatformId.SG2
    | PlatformId.TH2
    | PlatformId.TW2
    | PlatformId.VN2;

  export namespace METHOD_KEY {
    export namespace ACCOUNT {
      export const GET_BY_PUUID = "ACCOUNT.GET_BY_PUUID";
      export const GET_BY_RIOT_ID = "ACCOUNT.GET_BY_RIOT_ID";
      export const GET_BY_ACCESS_TOKEN = "ACCOUNT.GET_BY_ACCESS_TOKEN";
      export const GET_ACTIVE_SHARD_FOR_PLAYER =
        "ACCOUNT.GET_ACTIVE_SHARD_FOR_PLAYER";
    }
    export namespace CHAMPION_MASTERY {
      export const GET_ALL_CHAMPIONS = "CHAMPION_MASTERY.GET_ALL_CHAMPIONS";
      export const GET_CHAMPION_MASTERY =
        "CHAMPION_MASTERY.GET_CHAMPION_MASTERY";
      export const GET_TOP_CHAMPIONS = "CHAMPION_MASTERY.GET_TOP_CHAMPIONS";
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
      export const GET_ENTRIES_BY_PUUID = "LEAGUE.GET_ENTRIES_BY_PUUID";
      export const GET_ALL_ENTRIES = "LEAGUE.GET_ALL_ENTRIES";
      export const GET_GRANDMASTER_BY_QUEUE = "LEAGUE.GET_GRANDMASTER_BY_QUEUE";
      export const GET_LEAGUE_BY_ID = "LEAGUE.GET_LEAGUE_BY_ID";
      export const GET_MASTER_BY_QUEUE = "LEAGUE.GET_MASTER_BY_QUEUE";
    }

    export namespace LOL_CHALLENGES {
      export const GET_CONFIG = "LOL_CHALLENGES.GET_CONFIG";
      export const GET_PERCENTILES = "LOL_CHALLENGES.GET_PERCENTILES";
      export const GET_CONFIG_BY_ID = "LOL_CHALLENGES.GET_CONFIG_BY_ID";
      export const GET_LEADERBOARD_BY_ID =
        "LOL_CHALLENGES.GET_LEADERBOARD_BY_ID";
      export const GET_PERCENTILES_BY_ID =
        "LOL_CHALLENGES.GET_PERCENTILES_BY_ID";
      export const GET_PLAYER_DATA_BY_PUUID =
        "LOL_CHALLENGES.GET_PLAYER_DATA_BY_PUUID";
    }

    export namespace LOL_STATUS {
      export const GET_PLATFORM_DATA = "LOL_STATUS.GET_PLATFORM_DATA";
    }

    export namespace LOR_DECK {
      export const GET_DECKS_FOR_PLAYER = "LOR_DECK.GET_DECKS_FOR_PLAYER";
      export const POST_CREATE_DECK_FOR_PLAYER =
        "LOR_DECK.POST_CREATE_DECK_FOR_PLAYER";
    }

    export namespace LOR_INVENTORY {
      export const GET_CARDS_OWNED_BY_PLAYER =
        "LOR_INVENTORY.GET_CARDS_OWNED_BY_PLAYER";
    }

    export namespace LOR_MATCH {
      export const GET_MATCH_IDS_BY_PUUID = "LOR_MATCH.GET_MATCH_IDS_BY_PUUID";
      export const GET_MATCH_BY_ID = "LOR_MATCH.GET_MATCH_BY_ID";
    }
    export namespace LOR_RANKED {
      export const GET_MASTER_TIER = "LOR_RANKED.GET_MASTER_TIER";
    }

    export namespace LOR_STATUS_V1 {
      export const GET_PLATFORM_DATA = "LOR_STATUS_V1.GET_PLATFORM_DATA";
    }

    export namespace MATCH_V5 {
      export const GET_IDS_BY_PUUID = "MATCH_V5.GET_IDS_BY_PUUID";
      export const GET_MATCH_BY_ID = "MATCH_V5.GET_MATCH_BY_ID";
      export const GET_MATCH_TIMELINE_BY_ID =
        "MATCH_V5.GET_MATCH_TIMELINE_BY_ID";
    }

    export namespace SPECTATOR_TFT_V5 {
      export const GET_GAME_BY_PUUID = "SPECTATOR_TFT_V5.GET_GAME_BY_PUUID";
      export const GET_FEATURED_GAMES = "SPECTATOR_TFT_V5.GET_FEATURED_GAMES";
    }

    export namespace SPECTATOR {
      export const GET_GAME_BY_SUMMONER_ID =
        "SPECTATOR.GET_GAME_BY_SUMMONER_ID";
      export const GET_FEATURED_GAMES = "SPECTATOR.GET_FEATURED_GAMES";
    }
    export namespace SUMMONER {
      export const GET_BY_RSO_PUUID = "SUMMONER.GET_BY_RSO_PUUID";
      export const GET_BY_ACCOUNT_ID = "SUMMONER.GET_BY_ACCOUNT_ID";
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
      export const GET_TOP_RATED_LADDER_BY_QUEUE =
        "TFT_LEAGUE.GET_TOP_RATED_LADDER_BY_QUEUE";
    }
    export namespace TFT_MATCH {
      export const GET_MATCH_IDS_BY_PUUID = "TFT_MATCH.GET_MATCH_IDS_BY_PUUID";
      export const GET_MATCH_BY_ID = "TFT_MATCH.GET_MATCH_BY_ID";
    }

    export namespace TFT_STATUS_V1 {
      export const GET_PLATFORM_DATA = "TFT_STATUS_V1.GET_PLATFORM_DATA";
    }

    export namespace TFT_SUMMONER {
      export const GET_BY_ACCOUNT_ID = "TFT_SUMMONER.GET_BY_ACCOUNT_ID";
      export const GET_BY_ACCESS_TOKEN = "TFT_SUMMONER.GET_BY_ACCESS_TOKEN";
      export const GET_BY_PUUID = "TFT_SUMMONER.GET_BY_PUUID";
      export const GET_BY_SUMMONER_ID = "TFT_SUMMONER.GET_BY_SUMMONER_ID";
    }

    export namespace TOURNAMENT_STUB_V5 {
      export const POST_CREATE_CODES = "TOURNAMENT_STUB_V5.POST_CREATE_CODES";
      export const GET_TOURNAMENT_BY_CODE =
        "TOURNAMENT_STUB_V5.GET_TOURNAMENT_BY_CODE";
      export const GET_LOBBY_EVENTS_BY_TOURNAMENT_CODE =
        "TOURNAMENT_STUB_V5.GET_LOBBY_EVENTS_BY_TOURNAMENT_CODE";
      export const POST_CREATE_PROVIDER =
        "TOURNAMENT_STUB_V5.POST_CREATE_PROVIDER";
      export const POST_CREATE_TOURNAMENT =
        "TOURNAMENT_STUB_V5.POST_CREATE_TOURNAMENT";
    }

    export namespace TOURNAMENT_V5 {
      export const POST_CREATE_CODES = "TOURNAMENT_V5.POST_CREATE_CODES";
      export const GET_TOURNAMENT_BY_CODE =
        "TOURNAMENT_V5.GET_TOURNAMENT_BY_CODE";
      export const PUT_TOURNAMENT_CODE = "TOURNAMENT_V5.PUT_TOURNAMENT_CODE";
      export const GET_TOURNAMENT_GAME_DETAILS =
        "TOURNAMENT_V5.GET_TOURNAMENT_GAME_DETAILS";
      export const GET_LOBBY_EVENTS_BY_TOURNAMENT_CODE =
        "TOURNAMENT_V5.GET_LOBBY_EVENTS_BY_TOURNAMENT_CODE";
      export const POST_CREATE_PROVIDER = "TOURNAMENT_V5.POST_CREATE_PROVIDER";
      export const POST_CREATE_TOURNAMENT =
        "TOURNAMENT_V5.POST_CREATE_TOURNAMENT";
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

    export namespace VAL_RANKED {
      export const GET_LEADERBOARD_BY_QUEUE =
        "VAL_RANKED.GET_LEADERBOARD_BY_QUEUE";
    }

    export namespace VAL_STATUS_V1 {
      export const GET_PLATFORM_DATA = "VAL_STATUS_V1.GET_PLATFORM_DATA";
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
      puuid: string;
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

  export namespace LolChallenges {
    export enum lolChallengeState {
      DISABLED = "DISABLED", // Not visible and not calculated
      HIDDEN = "HIDDEN", // visible but calculated
      ENABLED = "ENABLED", // visible and calculated
      ARCHIVED = "ARCHIVED", // visible, but not calculated
    }

    export enum lolChallengeTracking {
      LIFETIME = "LIFETIME", // stats are incremented without reset
      SEASON = "SEASON", // stats are accumulated by season and reset at the beginning of new season
    }

    export enum lolChallengeCategory {
      VETERANCY = "VETERANCY",
      IMAGINATION = "IMAGINATION",
      COLLECTION = "COLLECTION",
      EXPERTISE = "EXPERTISE",
      TEAMWORK = "TEAMWORK",
    }

    export interface ChallengePoints {
      level: TIER;
      current: number;
      max: number;
      percentile: number;
    }

    export interface ChallengeInfo {
      challengeId: number;
      percentile: number;
      level: TIER;
      value: number;
      achievedTime: number;
    }

    export interface PlayerClientPreferences {
      bannerAccent: string;
      title: string;
      challengeIds: number[];
      crestBorder: string;
      prestigeCrestBorderLevel: number;
    }

    export interface ChallengeConfigInfoDTO {
      id: number;
      localizedNames: Record<string, Record<string, string>>;
      state: lolChallengeState;
      tracking: lolChallengeTracking;
      startTimestamp: number;
      endTimestamp: number;
      leaderboard: boolean;
      thresholds: Record<string, number>;
    }

    export type ChallengePercentiles = Record<TIER, number>;

    export type ChallengePercentilesMap = Record<number, ChallengePercentiles>;

    export interface ApexPlayerInfoDTO {
      puuid: string;
      value: number;
      position: number;
    }

    export interface PlayerInfoDTO {
      totalPoints: ChallengePoints;
      categoryPoints: Record<lolChallengeCategory, ChallengePoints>;
      challenges: ChallengeInfo[];
      preferences: PlayerClientPreferences;
    }
  }

  export namespace LolStatus {
    export interface PlatformDataDTO {
      id: string;
      name: string;
      locales: string[];
      maintenances: LolStatus.StatusDTO[];
      incidents: LolStatus.StatusDTO[];
    }

    export interface StatusDTO {
      id: number;
      maintenance_status: "scheduled" | "in_progress" | "complete";
      incident_severity: "info" | "warning" | "critical";
      titles: LolStatus.ContentDTO[];
      updates: LolStatus.UpdateDTO[];
      created_at: string;
      archive_at: string;
      updated_at: string;
      platforms: (
        | "windows"
        | "macos"
        | "android"
        | "ios"
        | "ps4"
        | "xbone"
        | "switch"
      )[];
    }

    export interface ContentDTO {
      locale: string;
      content: string;
    }

    export interface UpdateDTO {
      id: number;
      author: string;
      publish: boolean;
      publish_locations: ("riotclient" | "riotstatus" | "game")[];
      translations: LolStatus.ContentDTO[];
      created_at: string;
      updated_at: string;
    }
  }

  export namespace LorDeck {
    export interface DeckDTO {
      id: string;
      name: string;
      code: string;
    }

    export interface NewDeckDTO {
      name: string;
      code: string;
    }
  }

  export namespace LorInventory {
    export interface CardDTO {
      code: string;
      count: string;
    }
  }

  export namespace LorMatch {
    export interface PlayerDTO {
      puuid: string;
      deck_id: string;
      deck_code: string;
      factions: string[];
      game_outcome: string;
      order_of_play: number;
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

    export interface ChallengesDTO {
      "12AssistStreakCount": number;
      abilityUses: number;
      acesBefore15Minutes: number;
      alliedJungleMonsterKills: number;
      baronBuffGoldAdvantageOverThreshold: number;
      baronTakedowns: number;
      blastConeOppositeOpponentCount: number;
      bountyGold: number;
      buffsStolen: number;
      completeSupportQuestInTime: number;
      controlWardTimeCoverageInRiverOrEnemyHalf: number;
      controlWardsPlaced: number;
      damagePerMinute: number;
      damageTakenOnTeamPercentage: number;
      dancedWithRiftHerald: number;
      deathsByEnemyChamps: number;
      dodgeSkillShotsSmallWindow: number;
      doubleAces: number;
      dragonTakedowns: number;
      earliestBaron: number;
      earlyLaningPhaseGoldExpAdvantage: number;
      effectiveHealAndShielding: number;
      elderDragonKillsWithOpposingSoul: number;
      elderDragonMultikills: number;
      enemyChampionImmobilizations: number;
      enemyJungleMonsterKills: number;
      epicMonsterKillsNearEnemyJungler: number;
      epicMonsterKillsWithin30SecondsOfSpawn: number;
      epicMonsterSteals: number;
      epicMonsterStolenWithoutSmite: number;
      firstTurretKilled: number;
      firstTurretKilledTime: number;
      flawlessAces: number;
      fullTeamTakedown: number;
      gameLength: number;
      getTakedownsInAllLanesEarlyJungleAsLaner: number;
      goldPerMinute: number;
      hadOpenNexus: number;
      immobilizeAndKillWithAlly: number;
      initialBuffCount: number;
      initialCrabCount: number;
      jungleCsBefore10Minutes: number;
      junglerTakedownsNearDamagedEpicMonster: number;
      kTurretsDestroyedBeforePlatesFall: number;
      kda: number;
      killAfterHiddenWithAlly: number;
      killParticipation: number;
      killedChampTookFullTeamDamageSurvived: number;
      killingSprees: number;
      killsNearEnemyTurret: number;
      killsOnOtherLanesEarlyJungleAsLaner: number;
      killsOnRecentlyHealedByAramPack: number;
      killsUnderOwnTurret: number;
      killsWithHelpFromEpicMonster: number;
      knockEnemyIntoTeamAndKill: number;
      landSkillShotsEarlyGame: number;
      laneMinionsFirst10Minutes: number;
      laningPhaseGoldExpAdvantage: number;
      legendaryCount: number;
      legendaryItemUsed: number[];
      lostAnInhibitor: number;
      maxCsAdvantageOnLaneOpponent: number;
      maxKillDeficit: number;
      maxLevelLeadLaneOpponent: number;
      mejaisFullStackInTime: number;
      moreEnemyJungleThanOpponent: number;
      multiKillOneSpell: number;
      multiTurretRiftHeraldCount: number;
      multikills: number;
      multikillsAfterAggressiveFlash: number;
      outerTurretExecutesBefore10Minutes: number;
      outnumberedKills: number;
      outnumberedNexusKill: number;
      perfectDragonSoulsTaken: number;
      perfectGame: number;
      pickKillWithAlly: number;
      playedChampSelectPosition: number;
      poroExplosions: number;
      quickCleanse: number;
      quickFirstTurret: number;
      quickSoloKills: number;
      riftHeraldTakedowns: number;
      saveAllyFromDeath: number;
      scuttleCrabKills: number;
      skillshotsDodged: number;
      skillshotsHit: number;
      snowballsHit: number;
      soloBaronKills: number;
      soloKills: number;
      soloTurretsLategame: number;
      stealthWardsPlaced: number;
      survivedSingleDigitHpCount: number;
      survivedThreeImmobilizesInFight: number;
      takedownOnFirstTurret: number;
      takedowns: number;
      takedownsAfterGainingLevelAdvantage: number;
      takedownsBeforeJungleMinionSpawn: number;
      takedownsFirstXMinutes: number;
      takedownsInAlcove: number;
      takedownsInEnemyFountain: number;
      teamBaronKills: number;
      teamDamagePercentage: number;
      teamElderDragonKills: number;
      teamRiftHeraldKills: number;
      tookLargeDamageSurvived: number;
      turretPlatesTaken: number;
      turretTakedowns: number;
      turretsTakenWithRiftHerald: number;
      twentyMinionsIn3SecondsCount: number;
      twoWardsOneSweeperCount: number;
      unseenRecalls: number;
      visionScoreAdvantageLaneOpponent: number;
      visionScorePerMinute: number;
      wardTakedowns: number;
      wardTakedownsBefore20M: number;
      wardsGuarded: number;
    }

    export interface ParticipantDTO {
      assists: number;
      baronKills: number;
      bountyLevel: number;
      challenges: ChallengesDTO;
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
      endOfGameResult: string;
      gameCreation: number;
      gameDuration: number;
      gameId: number;
      gameMode: string;
      gameName: string;
      gameEndTimestamp: number;
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

  export namespace SpectatorTftV5 {
    export interface CurrentGameInfoDTO extends Spectator.CurrentGameInfoDTO {}

    export interface FeaturedGamesDTO {
      /** The list of featured games */
      gameList: SpectatorTftV5.FeaturedGameInfoDTO[];
      /** The suggested interval to wait before requesting FeaturedGames again */
      clientRefreshInterval: number;
    }

    export interface FeaturedGameInfoDTO {
      /** The game mode
       (Legal values: TFT) */
      gameMode: "TFT";
      /** The amount of time in seconds that has passed since the game started */
      gameLength: number;
      /** The ID of the map */
      mapId: number;
      /** The game type
       (Legal values:  MATCHED) */
      gameType: "MATCHED";
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
      participants: SpectatorTftV5.ParticipantDTO[];
      /** The ID of the platform on which the game is being played */
      platformId: string;
    }

    export interface ParticipantDTO {
      /** The ID of the second summoner spell used by this participant */
      spell2Id: number;
      /** The ID of the profile icon used by this participant */
      profileIconId: number;
      /** The encrypted summonerId of this participant */
      summonerId: string;
      /** The encrypted puuid of this participant */
      puuid: string;
      /** The ID of the champion played by this participant */
      championId: number;
      /** The team ID of this participant, indicating the participant's team */
      teamId: number;
      /** The ID of the first summoner spell used by this participant */
      spell1Id: number;
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
      /** The encrypted puuid of this participant */
      puuid: string;
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
      /** The encrypted puuid of this participant */
      puuid: string;
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
      puuid: string;
      summonerLevel: number;
      revisionDate: number;
    }
  }

  export namespace TftLeague {
    export enum RatedTier {
      ORANGE = "ORANGE",
      PURPLE = "PURPLE",
      BLUE = "BLUE",
      GREEN = "GREEN",
      GRAY = "GRAY",
    }
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
      leagueId?: string;
      /** Player's encrypted summonerId. */
      summonerId: string;
      queueType: string;
      ratedTier?: RatedTier;
      ratedRating?: number;
      tier?: string;
      rank?: string;
      leaguePoints?: number;
      /** First placement. */
      wins: number;
      /** Second through eighth placement. */
      losses: number;
      hotStreak?: boolean;
      veteran?: boolean;
      freshBlood?: boolean;
      inactive?: boolean;
      miniSeries?: TftLeague.MiniSeriesDTO | null;
    }

    export interface TopRatedLadderEntryDTO {
      summonerId: string;
      ratedTier: RatedTier;
      ratedRating: number;
      wins: number; // first placement
      previousUpdateLadderPosition: number;
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
      /** Teamfight Tactics game type. */
      tft_game_type: string;
      /** Teamfight Tactics set core name. */
      tft_set_core_name: string;
      /** Teamfight Tactics set number. */
      tft_set_number: number;
    }

    export interface ParticipantDTO {
      /** Participant's augments. */
      augments: string[];
      /** Participant's companion. */
      companion: TftMatch.CompanionDTO;
      /** Gold left after participant was eliminated. */
      gold_left: number;
      /** The round the participant was eliminated in. Note: If the player was eliminated in stage 2-1 their last_round would be 5. */
      last_round: number;
      /** Participant Little Legend level. Note: This is not the number of active units. */
      level: number;
      /** Partner group id. */
      partner_group_id: number;
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
      /** A list of the unit's items names. */
      itemNames: string[];
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

  export namespace TftStatusV1 {
    export interface PlatformDataDTO extends LolStatus.PlatformDataDTO {}

    export interface StatusDTO extends LolStatus.StatusDTO {}

    export interface ContentDTO extends LolStatus.ContentDTO {}

    export interface UpdateDTO extends LolStatus.UpdateDTO {}
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

  export namespace TournamentV5 {
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
      KR = "KR",
    }

    export enum PICKTYPE {
      BLIND_PICK = "BLIND_PICK",
      DRAFT_MODE = "DRAFT_MODE",
      ALL_RANDOM = "ALL_RANDOM",
      TOURNAMENT_DRAFT = "TOURNAMENT_DRAFT",
    }

    export enum MAPTYPE {
      SUMMONERS_RIFT = "SUMMONERS_RIFT",
      HOWLING_ABYSS = "HOWLING_ABYSS",
    }

    export enum SPECTATORTYPE {
      NONE = "NONE",
      LOBBYONLY = "LOBBYONLY",
      ALL = "ALL",
    }

    export interface TournamentCodeParametersV5DTO {
      /** Optional list of encrypted puuids in order to validate the players eligible to join the lobby. NOTE: We currently do not enforce participants at the team level, but rather the aggregate of teamOne and teamTwo. We may add the ability to enforce at the team level in the future. */
      allowedParticipants?: string[] | null;
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
      /** Checks if allowed participants are enough to make full teams */
      enoughPlayers: boolean;
    }

    export interface ProviderRegistrationParametersV5DTO {
      /** The region in which the provider will be running tournaments.
           (Legal values:  BR,  EUNE,  EUW,  JP,  LAN,  LAS,  NA,  OCE,  PBE,  RU,  TR, KR) */
      region: REGION;
      /** The provider's callback URL to which tournament game results in this region should be posted. The URL must be well-formed, use the http or https protocol, and use the default port for the protocol (http URLs must use port 80, https URLs must use port 443). */
      url: string;
    }

    export interface TournamentRegistrationParametersV5DTO {
      /** The provider ID to specify the regional registered provider data to associate this tournament. */
      providerId: number;
      /** The optional name of the tournament. */
      name?: string | null;
    }

    export interface TournamentCodeV5DTO {
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
           (Legal values:  BR,  EUNE,  EUW,  JP,  LAN,  LAS,  NA,  OCE,  PBE,  RU,  TR, KR) */
      region: REGION;
      /** The game map for the tournament code game */
      map: string;
      /** The puuids of the participants (Encrypted) */
      participants: string[];
    }

    export interface TournamentCodeUpdateParametersV5DTO {
      /** Optional list of encrypted puuids in order to validate the players eligible to join the lobby. NOTE: We currently do not enforce participants at the team level, but rather the aggregate of teamOne and teamTwo. We may add the ability to enforce at the team level in the future. */
      allowedParticipants?: string[] | null;
      /** The pick type
           (Legal values:  BLIND_PICK,  DRAFT_MODE,  ALL_RANDOM,  TOURNAMENT_DRAFT) */
      pickType: PICKTYPE;
      /** The map type
           (Legal values:  SUMMONERS_RIFT,  HOWLING_ABYSS) */
      mapType: MAPTYPE;
      /** The spectator type
           (Legal values:  NONE,  LOBBYONLY,  ALL) */
      spectatorType: SPECTATORTYPE;
    }

    export interface LobbyEventV5DTOWrapper {
      eventList: TournamentV5.LobbyEventV5DTO[];
    }

    export interface LobbyEventV5DTO {
      /** Timestamp from the event */
      timestamp: string;
      /** The type of event that was triggered */
      eventType: string;
      /** The puuid that triggered the event (Encrypted) */
      puuid: string;
    }

    export interface TournamentTeamV5DTO {
      /** Player unique UUID (Encrypted) */
      puuid: string;
    }

    export interface TournanmentGamesV5DTO {
      winningTeam: TournamentV5.TournamentTeamV5DTO[];
      losingTeam: TournamentV5.TournamentTeamV5DTO[];
      /** Tournament Code */
      shortCode: string;
      metaData: string;
      gameId: number;
      gameName: string;
      gameType: string;
      gameMap: number;
      gameMode: string;
      region: LoLRegion;
    }

    /** Server Callback DTO */
    export interface TournamentGamesServerCallbackV5DTO {
      startTime: number;
      shortCode: string;
      metaData: string;
      gameId: number;
      gameName: string;
      gameType: string;
      gameMode: string;
      region: LoLRegion;
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

    export interface ActDTO {
      name: string;
      /** This field is excluded from the response when a locale is set */
      localizedNames?: ValContent.LocalizedNamesDTO | null;
      id: string;
      isActive: string;
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

    export interface ContentDTO {
      version: string;
      characters: ContentItemDTO[];
      maps: ContentItemDTO[];
      chromas: ContentItemDTO[];
      skins: ContentItemDTO[];
      skinLevels: ContentItemDTO[];
      equips: ContentItemDTO[];
      gameModes: ContentItemDTO[];
      sprays: ContentItemDTO[];
      sprayLevels: ContentItemDTO[];
      charms: ContentItemDTO[];
      charmLevels: ContentItemDTO[];
      playerCards: ContentItemDTO[];
      playerTitles: ContentItemDTO[];
      acts: ActDTO[];
    }
  }

  export namespace ValMatch {
    export interface MatchDTO {
      matchInfo: ValMatch.MatchInfoDTO;
      players: ValMatch.PlayerDTO[];
      coaches: ValMatch.CoachDTO[];
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

    export interface CoachDTO {
      puuid: string;
      teamId: string;
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
      queueId: string;
    }

    export interface RecentMatchesDTO {
      currentTime: number;
      matchIds: string[];
    }
  }

  export namespace ValRanked {
    export interface PlayerDTO {
      puuid: string; // This field may be omitted if the player has been anonymized.
      gameName: string; // This field may be omitted if the player has been anonymized.
      tagLine: string; // This field may be omitted if the player has been anonymized.
      leaderboardRank: number;
      rankedRating: number;
      numberOfWins: number;
    }
    export interface LeaderboardDTO {
      shared: string;
      actId: string;
      totalPlayers: number;
      players: ValRanked.PlayerDTO[];
    }
  }

  export namespace ValStatusV1 {
    export interface PlatformDataDTO extends LolStatus.PlatformDataDTO {}

    export interface StatusDTO extends LolStatus.StatusDTO {}

    export interface ContentDTO extends LolStatus.ContentDTO {}

    export interface UpdateDTO extends LolStatus.UpdateDTO {}
  }

  export namespace DDragon {
    export enum REALM {
      NA = "na",
      EUW = "euw",
      EUNE = "eune",
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
      vi_VN = "vi_VN", // Vietnamese (Viet Nam)
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
      full: string;
      sprite: string;
      group: string;
      x: number;
      y: number;
      w: number;
      h: number;
    }

    export interface DDragonMapDTO
      extends DDragonDataWrapper<DDragonMapDataDTO> {}

    export interface DDragonMapDataDTO {
      MapName: string;
      MapId: string;
      image: DDragonImageDTO;
    }

    export interface DDragonImageWrapperDTO {
      id: number;
      image: DDragonImageDTO;
    }

    export interface DDragonProfileIconDTO
      extends DDragonDataWrapper<DDragonImageWrapperDTO> {}

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
      datavalues: object;
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
      datavalues: object;
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
