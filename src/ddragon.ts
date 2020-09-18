import fetch from "node-fetch";
import { RiotAPITypes } from "./index";

export class DDragon {
  readonly locale: RiotAPITypes.DDragon.LOCALE =
    RiotAPITypes.DDragon.LOCALE.en_GB;
  readonly defaultRealm: RiotAPITypes.DDragon.REALM =
    RiotAPITypes.DDragon.REALM.EUW;

  readonly host: string = "https://ddragon.leagueoflegends.com";

  async request<T>(path: string): Promise<T> {
    const resp = await fetch(`${this.host}${path}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (resp.ok) return resp.json();
    throw resp;
  }

  get versions() {
    return {
      latest: async (): Promise<string> => {
        const ddVersions: string[] = await this.request("/api/versions.json");
        return ddVersions[0];
      },
      all: (): Promise<string[]> => this.request("/api/versions.json"),
    };
  }

  get champion() {
    return {
      all: async ({
        locale = this.locale,
        version,
      }: {
        locale?: RiotAPITypes.DDragon.LOCALE;
        version?: string;
      } = {}): Promise<RiotAPITypes.DDragon.DDragonChampionListDTO> => {
        const v = version || (await this.versions.latest());
        return await this.request(`/cdn/${v}/data/${locale}/champion.json`);
      },
      byName: async ({
        locale = this.locale,
        version,
        championName,
      }: {
        locale?: RiotAPITypes.DDragon.LOCALE;
        version?: string;
        championName: string;
      }): Promise<RiotAPITypes.DDragon.DDragonChampionDTO> => {
        if (!championName) throw new Error("championName is required");
        const v = version || (await this.versions.latest());
        return await this.request(
          `/cdn/${v}/data/${locale}/champion/${championName}.json`
        );
      },
    };
  }

  async realm({
    realm = this.defaultRealm,
  }: {
    realm?: RiotAPITypes.DDragon.REALM;
  } = {}): Promise<RiotAPITypes.DDragon.DDragonRealmsDTO> {
    return await this.request(`/realms/${realm}.json`);
  }

  async items({
    locale = this.locale,
    version,
  }: {
    locale?: RiotAPITypes.DDragon.LOCALE;
    version?: string;
  } = {}): Promise<RiotAPITypes.DDragon.DDragonItemWrapperDTO> {
    const v = version || (await this.versions.latest());
    return await this.request(`/cdn/${v}/data/${locale}/item.json`);
  }

  async runesReforged({
    locale = this.locale,
    version,
  }: {
    locale?: RiotAPITypes.DDragon.LOCALE;
    version?: string;
  } = {}): Promise<RiotAPITypes.DDragon.DDragonRunesReforgedDTO[]> {
    const v = version || (await this.versions.latest());
    return await this.request(`/cdn/${v}/data/${locale}/runesReforged.json`);
  }

  async summonerSpells({
    locale = this.locale,
    version,
  }: {
    locale?: RiotAPITypes.DDragon.LOCALE;
    version?: string;
  } = {}): Promise<RiotAPITypes.DDragon.DDragonSummonerSpellDTO> {
    const v = version || (await this.versions.latest());
    return await this.request(`/cdn/${v}/data/${locale}/summoner.json`);
  }

  async profileIcons({
    locale = this.locale,
    version,
  }: {
    locale?: RiotAPITypes.DDragon.LOCALE;
    version?: string;
  } = {}): Promise<RiotAPITypes.DDragon.DDragonProfileIconDTO> {
    const v = version || (await this.versions.latest());
    return await this.request(`/cdn/${v}/data/${locale}/profileicon.json`);
  }

  async maps({
    locale = this.locale,
    version,
  }: {
    locale?: RiotAPITypes.DDragon.LOCALE;
    version?: string;
  } = {}): Promise<RiotAPITypes.DDragon.DDragonMapDTO> {
    const v = version || (await this.versions.latest());
    return await this.request(`/cdn/${v}/data/${locale}/map.json`);
  }
}
