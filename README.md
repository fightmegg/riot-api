# RiotAPI

[![Version](https://img.shields.io/npm/v/@fightmegg/riot-api.svg)](https://www.npmjs.com/package/@fightmegg/riot-api)
[![Downloads](https://img.shields.io/npm/dm/@fightmegg/riot-api.svg)](https://www.npmjs.com/package/@fightmegg/riot-api)
[![CircleCI](https://circleci.com/gh/fightmegg/riot-api/tree/master.svg?style=svg)](https://circleci.com/gh/fightmegg/riot-api/tree/master)

> Node.JS minimal Riot API client written in Typescript


### Features

* Rate limiting through [@fightmegg/riot-rate-limiter](https://github.com/fightmegg/riot-rate-limiter)
* Automatic retries
* TypeScript typings
* 100% endpoint coverage (incl. DDragon)
* Caching with custom ttls per endpoint
* Request prioritization


## Installation

```shell
$ npm install @fightmegg/riot-api
```

## Usage

```ts
import { RiotAPI, RiotAPITypes, PlatformId } from '@fightmegg/riot-api'

(async () => {
    const rAPI = new RiotAPI('RGAPI-KEY');

    const summoner = await rAPI.summoner.getBySummonerName({
        region: PlatformId.EUW1,
        summonerName: "Demos Kratos",
      });
})()
```

## Config

```ts
const config: RiotAPITypes.Config = {
    debug: false,
    cache: {
        cacheType: 'local', // local or ioredis
        client: 'redis://localhost:6739', // leave null if client is local
        ttls: {
            byMethod: {
                [RiotAPITypes.METHOD_KEY.SUMMONER.GET_BY_SUMMONER_NAME]: 5000, // ms
            }
        }
    }
}

const rAPI = new RiotAPI('RGAPI-TOKEN', config);
```

## Error handling

If you use `Promises` then any error will reject the promise, this can either be an error value, or the response from the API.

Same as above with `async/await`, where the error thrown will be the response from the API if the error occured at that level.

## Caching

Caching is turned off by default, but with the cache property in the config you can enable it with various settings. For now we only support local (in memory) or [ioredis](https://github.com/luin/ioredis) caches, will potential support for custom caches in future.

When setting up the cache, you can change the `ttl` of each method / endpoint individually. This is done through the `METHOD_KEY` type which can be found in the [typings file](https://github.com/fightmegg/riot-api/blob/master/src/%40types/index.ts#L92).


## DDragon

We also fully support [DataDragon](https://developer.riotgames.com/docs/lol#data-dragon) which can be accessed in two ways:

```ts
// ...
const rAPI = new RiotAPI('RGAPI-KEY');

const latestV = await rAPI.ddragon.versions.latest();
const champs = await rAPI.ddragon.champion.all();
```

If you want to just use static data only, then you can do the following:

```ts
import { DDragon } from '@fightmegg/riot-api';

const ddragon = new DDragon();
const champs = await ddragon.champion.all();
```

Just like the main API, we have full TypeScript typings for DDragon endpoints. Please note we **do not** support caching for DDragon endpoints.

## TypeScript typing

```ts
import { RiotAPI, RiotAPITypes, PlatformId } from '@fightmegg/riot-api';

// ...

const summoner: RiotAPITypes.Summoner.SummonerDTO = await rAPI.summoner.getBySummonerName(...);
```

## Debugging

If you want to see want the rate-limiter is currently doing, we use the [debug](https://github.com/visionmedia/debug) module for logging. Simply run your app with:

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