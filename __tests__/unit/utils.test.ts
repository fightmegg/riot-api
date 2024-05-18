import { PlatformId } from "@fightmegg/riot-rate-limiter";
import { regionToCluster } from "../../src/utils";

describe("utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("regionToCluster", () => {
    test("should return correct cluster for each region", () => {
      expect(regionToCluster(PlatformId.NA1)).toEqual(PlatformId.AMERICAS);
      expect(regionToCluster(PlatformId.BR1)).toEqual(PlatformId.AMERICAS);
      expect(regionToCluster(PlatformId.LA1)).toEqual(PlatformId.AMERICAS);
      expect(regionToCluster(PlatformId.LA2)).toEqual(PlatformId.AMERICAS);

      expect(regionToCluster(PlatformId.KR)).toEqual(PlatformId.ASIA);
      expect(regionToCluster(PlatformId.JP1)).toEqual(PlatformId.ASIA);

      expect(regionToCluster(PlatformId.EUW1)).toEqual(PlatformId.EUROPE);
      expect(regionToCluster(PlatformId.EUNE1)).toEqual(PlatformId.EUROPE);
      expect(regionToCluster(PlatformId.TR1)).toEqual(PlatformId.EUROPE);
      expect(regionToCluster(PlatformId.RU)).toEqual(PlatformId.EUROPE);

      expect(regionToCluster(PlatformId.OC1)).toEqual(PlatformId.SEA);
      expect(regionToCluster(PlatformId.PH2)).toEqual(PlatformId.SEA);
      expect(regionToCluster(PlatformId.SG2)).toEqual(PlatformId.SEA);
      expect(regionToCluster(PlatformId.TH2)).toEqual(PlatformId.SEA);
      expect(regionToCluster(PlatformId.TW2)).toEqual(PlatformId.SEA);
      expect(regionToCluster(PlatformId.VN2)).toEqual(PlatformId.SEA);

      // @ts-expect-error -- testing invalid input
      expect(regionToCluster("invalid")).toEqual(PlatformId.AMERICAS);
    });
  });
});
