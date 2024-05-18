import { PlatformId } from "@fightmegg/riot-rate-limiter";
import { RiotAPITypes } from "./@types";

export function regionToCluster(
  region: RiotAPITypes.LoLRegion
): RiotAPITypes.Cluster {
  switch (region) {
    case PlatformId.NA1:
    case PlatformId.BR1:
    case PlatformId.LA1:
    case PlatformId.LA2:
      return PlatformId.AMERICAS;
    case PlatformId.KR:
    case PlatformId.JP1:
      return PlatformId.ASIA;
    case PlatformId.EUW1:
    case PlatformId.EUNE1:
    case PlatformId.TR1:
    case PlatformId.RU:
      return PlatformId.EUROPE;
    case PlatformId.OC1:
    case PlatformId.PH2:
    case PlatformId.SG2:
    case PlatformId.TH2:
    case PlatformId.TW2:
    case PlatformId.VN2:
      return PlatformId.SEA;
    default:
      return PlatformId.AMERICAS;
  }
}
