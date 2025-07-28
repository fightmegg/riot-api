import { DDragon, RiotAPI, RiotAPITypes } from "../../src/index";

describe("E2E", () => {
  describe("DDragon", () => {
    describe("champion", () => {
      test("byName", async () => {
        const ddragon = new DDragon();

        const aatrox = await ddragon.champion.byName({
          championName: "Aatrox",
        });

        const aatroxImage: RiotAPITypes.DDragon.DDragonImageDTO = {
          full: "Aatrox.png",
          sprite: "champion0.png",
          group: "champion",
          x: 0,
          y: 0,
          w: 48,
          h: 48,
        };

        expect(aatrox.type).toEqual("champion");
        expect(aatrox.format).toEqual("standAloneComplex");
        expect(aatrox.data.Aatrox.id).toEqual("Aatrox");
        expect(aatrox.data.Aatrox.image).toEqual(aatroxImage);
      });

      test("profileIcons", async () => {
        const ddragon = new DDragon();
        const profileIcons = await ddragon.profileIcons();
        const profilIcon: RiotAPITypes.DDragon.DDragonImageWrapperDTO = {
          id: 1000,
          image: {
            full: "1000.png",
            sprite: "profileicon0.png",
            group: "profileicon",
            x: 336,
            y: 0,
            w: 48,
            h: 48,
          },
        };
        expect(profileIcons.data["1000"]).toEqual(profilIcon);
      });
    });
  });

  describe("RiotAPI.DDragon", () => {
    describe("champion", () => {
      test("byName", async () => {
        const rAPI = new RiotAPI("XXXX");

        const aatrox = await rAPI.ddragon.champion.byName({
          championName: "Aatrox",
        });

        const aatroxImage: RiotAPITypes.DDragon.DDragonImageDTO = {
          full: "Aatrox.png",
          sprite: "champion0.png",
          group: "champion",
          x: 0,
          y: 0,
          w: 48,
          h: 48,
        };

        expect(aatrox.type).toEqual("champion");
        expect(aatrox.format).toEqual("standAloneComplex");
        expect(aatrox.data.Aatrox.id).toEqual("Aatrox");
        expect(aatrox.data.Aatrox.image).toEqual(aatroxImage);
      });

      test("profileIcons", async () => {
        const rAPI = new RiotAPI("XXXX");
        const profileIcons = await rAPI.ddragon.profileIcons();
        const profilIcon: RiotAPITypes.DDragon.DDragonImageWrapperDTO = {
          id: 1000,
          image: {
            full: "1000.png",
            sprite: "profileicon0.png",
            group: "profileicon",
            x: 336,
            y: 0,
            w: 48,
            h: 48,
          },
        };
        expect(profileIcons.data["1000"]).toEqual(profilIcon);
      });
    });
  });
});
