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
    });
  });

  describe("RiotAPI.DDragon", () => {
    describe("champion", () => {
      test("byName", async () => {
        const rAPI = new RiotAPI("XXXX");

        const aatrox = await rAPI.ddragon.champion.byName({
          championName: "Aatrox",
        });
        expect(aatrox.type).toEqual("champion");
        expect(aatrox.format).toEqual("standAloneComplex");
        expect(aatrox.data.Aatrox.id).toEqual("Aatrox");
      });
    });
  });
});
