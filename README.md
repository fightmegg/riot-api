# RiotAPI

[![Version](https://img.shields.io/npm/v/@fightmegg/riot-api.svg)](https://www.npmjs.com/package/@fightmegg/riot-api)
[![Downloads](https://img.shields.io/npm/dm/@fightmegg/riot-api.svg)](https://www.npmjs.com/package/@fightmegg/riot-api)
[![CircleCI](https://circleci.com/gh/fightmegg/riot-api/tree/master.svg?style=svg)](https://circleci.com/gh/fightmegg/riot-api/tree/master)

> Node.JS minimal Riot API client written in Typescript

### Features

- Rate limiting through [@fightmegg/riot-rate-limiter](https://github.com/fightmegg/riot-rate-limiter)
- Automatic retries
- TypeScript typings
- 100% endpoint coverage (incl. DDragon)
- Caching with custom TTLs per endpoint
- Request prioritization

## Installation

```shell
$ npm install @fightmegg/riot-api
```

## Usage

```ts
import { RiotAPI, RiotAPITypes, PlatformId } from "@fightmegg/riot-api";

(async () => {
  const rAPI = new RiotAPI("RGAPI-KEY" {
    cache: {
      cacheType: "local",
      ttls: {
        byMethod: {
          //TTLs are defined in milliseconds
          [RiotAPITypes.METHOD_KEY.ACCOUNT.GET_BY_RIOT_ID]: 3_600_000, // 1 hour
          [RiotAPITypes.METHOD_KEY.SUMMONER.GET_BY_PUUID]: 24 * 60 * 60 * 1000, // 24 hours
        },
      },
    },
  });

  const account = await rAPI.account.getByRiotId({
    cluster: PlatformId.ASIA,
    gameName: "Hide on bush",
    tagLine: "KR1",
  });

  const summoner = await rAPI.summoner.getByPUUID({
    region: PlatformId.KR,
    puuid: account.puuid,
  });
})();
```

## Config

```ts
const config: RiotAPITypes.Config = {
  debug: false,
  cache: {
    cacheType: "ioredis", // local, ioredis or mongodb
    client: "redis://localhost:6379", // leave null if client is local
    ttls: {
      byMethod: {
        [RiotAPITypes.METHOD_KEY.SUMMONER.GET_BY_SUMMONER_NAME]: 5000, // ms
      },
    },
  },
};

const rAPI = new RiotAPI("RGAPI-KEY", config);
```

## Error handling

If you use `Promises`, any error will reject the promise. This can either be an error value or the response from the API.

The same applies to `async/await`, where the error thrown will be the response from the API if the error occurred at that level.

## Caching

Caching is turned off by default, but you can enable it with various settings using the `cache` property in the config. Currently, we support local (in-memory), [ioredis](https://github.com/redis/ioredis) and [mongodb](https://github.com/mongodb/node-mongodb-native) caches, with potential support for custom caches in the future.

When setting up the cache, you can change the `ttl` of each method/endpoint individually. This is done through the `METHOD_KEY` type, which can be found in the [typings file](https://github.com/fightmegg/riot-api/blob/master/src/%40types/index.ts#L92).

## DDragon

We fully support [DataDragon](https://developer.riotgames.com/docs/lol#data-dragon), which can be accessed in two ways:

```ts
// ...
const rAPI = new RiotAPI("RGAPI-KEY");

const latestV = await rAPI.ddragon.versions.latest();
const champs = await rAPI.ddragon.champion.all();
```

If you want to use static data only, you can do the following:

```ts
import { DDragon } from "@fightmegg/riot-api";

const ddragon = new DDragon();
const champs = await ddragon.champion.all();
```

Just like the main API, we have full TypeScript typings for DDragon endpoints. Please note we **do not** support caching for DDragon endpoints.

## regionToCluster

A helper method that makes it easier to determine which cluster to target based on the user's region.

```ts
import { regionToCluster } from "@fightmegg/riot-api";

const cluster = regionToCluster("EUW1"); // outputs "EUROPE"
```

## TypeScript typing

```ts
import { RiotAPI, RiotAPITypes, PlatformId } from '@fightmegg/riot-api';

// ...

const summoner: RiotAPITypes.Summoner.SummonerDTO = await rAPI.summoner.getBySummonerName(...);
```

## Debugging

If you want to see what the rate-limiter is currently doing, we use the [debug](https://github.com/visionmedia/debug) module for logging. Simply run your app with:

```shell
DEBUG=riotapi* node ...
```

## Testing

Unit tests: `npm test`

E2E tests: `npm run test:e2e`

## Planned features

- [ ] Custom Caches
- [ ] Interceptors (before request & on response)

## Maintainers

[@olliejennings](https://github.com/olliejennings)
