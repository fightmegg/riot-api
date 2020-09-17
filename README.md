# RiotAPI

[![Version](https://img.shields.io/npm/v/@fightmegg/riot-api.svg)](https://www.npmjs.com/package/@fightmegg/riot-api)
[![Downloads](https://img.shields.io/npm/dm/@fightmegg/riot-api.svg)](https://www.npmjs.com/package/@fightmegg/riot-api)
[![CircleCI](https://circleci.com/gh/fightmegg/riot-api/tree/master.svg?style=svg)](https://circleci.com/gh/fightmegg/riot-api/tree/master)

> Node.JS minimal Riot API client written in Typescript


### Features

* Rate limiting through [@fightmegg/riot-rate-limiter](https://github.com/fightmegg/riot-rate-limiter)
* Automatic retries
* TypeScript typings
* 100% endpoint coverage
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

## Caching

Caching is support by methods only, we provide a complete map of all `METHOD_KEY`'s for setting up your cache config. The list of keys can be found in the [types file]().


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

## Maintainers

[@olliejennings](https://github.com/olliejennings)