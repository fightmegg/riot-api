import { mocked } from "ts-jest/utils";
import { RiotAPITypes, DDragon } from "../../src";
import fetch from "node-fetch";

jest.mock("node-fetch");

describe("DDragon", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const getKeyValue = <T extends object, U extends keyof T>(obj: T) => (
    key: U
  ) => obj[key];

  const mockedFetch = mocked(fetch);

  describe("constructor", () => {
    test("should set defaults when initalized", () => {
      const ddragon = new DDragon();

      expect(ddragon.defaultRealm).toEqual(RiotAPITypes.DDragon.REALM.EUW);
      expect(ddragon.host).toEqual("https://ddragon.leagueoflegends.com");
      expect(ddragon.locale).toEqual(RiotAPITypes.DDragon.LOCALE.en_GB);
    });
  });

  describe("request", () => {
    test("should call fetch with full url & headers", async () => {
      const mockJson = jest.fn().mockResolvedValue("ok");
      mockedFetch.mockResolvedValue({ ok: true, json: mockJson } as any);

      const ddragon = new DDragon();
      await expect(ddragon.request("/realms/na.json")).resolves.toEqual("ok");

      expect(mockedFetch).toHaveBeenCalledWith(
        `${ddragon.host}/realms/na.json`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      expect(mockJson).toHaveBeenCalled();
    });

    test("should throw if resp.ok === false", async () => {
      mockedFetch.mockResolvedValue({ ok: false } as any);

      const ddragon = new DDragon();
      await expect(ddragon.request("/realms/na.json")).rejects.toEqual({
        ok: false,
      });
    });
  });

  describe("versions", () => {
    test("latest -> calls request with correct URL and returns first version in resp", async () => {
      const ddragon = new DDragon();
      ddragon.request = jest.fn().mockResolvedValue(["10.19", "10.18"]);

      await expect(ddragon.versions.latest()).resolves.toEqual("10.19");
      expect(ddragon.request).toHaveBeenCalledWith("/api/versions.json");
    });

    test("all -> calls request with correct URL and returns full resp", async () => {
      const ddragon = new DDragon();
      ddragon.request = jest.fn().mockResolvedValue(["10.19", "10.18"]);

      await expect(ddragon.versions.all()).resolves.toEqual(["10.19", "10.18"]);
      expect(ddragon.request).toHaveBeenCalledWith("/api/versions.json");
    });
  });

  describe("champion", () => {
    test("all -> calls request with default local & latest version", async () => {
      const ddragon = new DDragon();
      ddragon.request = jest
        .fn()
        .mockResolvedValueOnce(["10.19"])
        .mockResolvedValue({ type: "champion" });

      await expect(ddragon.champion.all()).resolves.toEqual({
        type: "champion",
      });
      expect(ddragon.request).toHaveBeenNthCalledWith(
        2,
        "/cdn/10.19/data/en_GB/champion.json"
      );
    });

    test("all -> calls request with custom local & version", async () => {
      const ddragon = new DDragon();
      ddragon.request = jest.fn().mockResolvedValue({ type: "champion" });

      await expect(
        ddragon.champion.all({
          version: "10.18",
          locale: RiotAPITypes.DDragon.LOCALE.en_AU,
        })
      ).resolves.toEqual({ type: "champion" });
      expect(ddragon.request).toHaveBeenCalledWith(
        "/cdn/10.18/data/en_AU/champion.json"
      );
    });

    test("byName -> calls request with default local & latest version for specific champ", async () => {
      const ddragon = new DDragon();
      ddragon.request = jest
        .fn()
        .mockResolvedValueOnce(["10.19"])
        .mockResolvedValue({ type: "championSingle" });

      await expect(
        ddragon.champion.byName({ championName: "Aatrox" })
      ).resolves.toEqual({
        type: "championSingle",
      });
      expect(ddragon.request).toHaveBeenNthCalledWith(
        2,
        "/cdn/10.19/data/en_GB/champion/Aatrox.json"
      );
    });
  });

  describe("realm", () => {
    test.each([
      ["/realms/euw.json", undefined, { type: "euw" }],
      [
        "/realms/br.json",
        { realm: RiotAPITypes.DDragon.REALM.BR },
        { type: "br" },
      ],
    ])("should call request with %s", async (url, args, resp) => {
      const ddragon = new DDragon();
      ddragon.request = jest.fn().mockResolvedValue(resp);

      await expect(ddragon.realm(args)).resolves.toEqual(resp);
      expect(ddragon.request).toHaveBeenCalledWith(url);
    });
  });

  describe("item", () => {
    test.each([
      ["/cdn/10.19/data/en_GB/item.json", undefined, { type: "item" }],
    ])("should call request with %s", async (url, args, resp) => {
      const ddragon = new DDragon();
      ddragon.request = jest
        .fn()
        .mockResolvedValueOnce(["10.19"])
        .mockResolvedValue(resp);

      await expect(ddragon.items(args)).resolves.toEqual(resp);
      expect(ddragon.request).toHaveBeenNthCalledWith(2, url);
    });
  });

  describe("runesReforged", () => {
    test.each([
      [
        "/cdn/10.19/data/en_GB/runesReforged.json",
        undefined,
        { type: "runes" },
      ],
    ])("should call request with %s", async (url, args, resp) => {
      const ddragon = new DDragon();
      ddragon.request = jest
        .fn()
        .mockResolvedValueOnce(["10.19"])
        .mockResolvedValue(resp);

      await expect(ddragon.runesReforged(args)).resolves.toEqual(resp);
      expect(ddragon.request).toHaveBeenNthCalledWith(2, url);
    });
  });

  describe("summonerSpells", () => {
    test.each([
      [
        "/cdn/10.19/data/en_GB/summoner.json",
        undefined,
        { type: "summonerSpells" },
      ],
    ])("should call request with %s", async (url, args, resp) => {
      const ddragon = new DDragon();
      ddragon.request = jest
        .fn()
        .mockResolvedValueOnce(["10.19"])
        .mockResolvedValue(resp);

      await expect(ddragon.summonerSpells(args)).resolves.toEqual(resp);
      expect(ddragon.request).toHaveBeenNthCalledWith(2, url);
    });
  });

  describe("profileIcons", () => {
    test.each([
      [
        "/cdn/10.19/data/en_GB/profileicon.json",
        undefined,
        { type: "profileIcons" },
      ],
    ])("should call request with %s", async (url, args, resp) => {
      const ddragon = new DDragon();
      ddragon.request = jest
        .fn()
        .mockResolvedValueOnce(["10.19"])
        .mockResolvedValue(resp);

      await expect(ddragon.profileIcons(args)).resolves.toEqual(resp);
      expect(ddragon.request).toHaveBeenNthCalledWith(2, url);
    });
  });

  describe("maps", () => {
    test.each([
      ["/cdn/10.19/data/en_GB/map.json", undefined, { type: "maps" }],
    ])("should call request with %s", async (url, args, resp) => {
      const ddragon = new DDragon();
      ddragon.request = jest
        .fn()
        .mockResolvedValueOnce(["10.19"])
        .mockResolvedValue(resp);

      await expect(ddragon.maps(args)).resolves.toEqual(resp);
      expect(ddragon.request).toHaveBeenNthCalledWith(2, url);
    });
  });
});
