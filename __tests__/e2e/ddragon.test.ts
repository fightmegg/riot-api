import { DDragon, RiotAPI } from "../../src/index";

describe("E2E", () => {
  describe("DDragon", () => {
    describe("champion", () => {
      test("byName", async () => {
        const ddragon = new DDragon();

        const aatrox = await ddragon.champion.byName({
          championName: "Aatrox",
        });
        expect(aatrox.type).toEqual("champion");
        expect(aatrox.format).toEqual("standAloneComplex");
        expect(aatrox.data.Aatrox.id).toEqual("Aatrox");
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
