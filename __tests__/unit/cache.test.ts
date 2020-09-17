import { MemoryCache, RedisCache } from "../../src/cache";
import Redis from "ioredis";

jest.mock("ioredis");

describe("Cache", () => {
  describe("MemoryCache", () => {
    let memCache: MemoryCache;

    beforeEach(() => {
      memCache = new MemoryCache();
    });

    test("initialises with empty cache", () => {
      expect(memCache.cache).toEqual({});
    });

    test("set -> adds value to cache", async () => {
      await expect(memCache.set("key", { a: 1 }, 0)).resolves.toEqual("OK");

      expect(memCache.cache.key).toEqual({
        expires: 0,
        value: { a: 1 },
      });
    });

    test("set -> adds value with a ttl in the future", async () => {
      await expect(memCache.set("key", { a: 1 }, 50000)).resolves.toEqual("OK");

      expect(memCache.cache.key).toEqual({
        expires: expect.any(Number),
        value: { a: 1 },
      });
    });

    test("get -> returns NULL if value not in cache", async () => {
      await expect(memCache.get("key")).resolves.toBeNull();
    });

    test("get -> returns NULL if value in cache has expired", async () => {
      await expect(memCache.set("key", { a: 1 }, 0)).resolves.toEqual("OK");
      await expect(memCache.get("key")).resolves.toBeNull();
      expect(memCache.cache).toEqual({});
    });

    test("get -> returns value if value in cache and not expired", async () => {
      await expect(memCache.set("key", { a: 1 }, 50000)).resolves.toEqual("OK");
      await expect(memCache.get("key")).resolves.toEqual({ a: 1 });
    });

    test("flush -> empties the cache", async () => {
      await expect(memCache.set("key", { a: 1 }, 50000)).resolves.toEqual("OK");
      expect(memCache.cache.key).not.toBeUndefined();
      await expect(memCache.flush()).resolves.toEqual("OK");
      expect(memCache.cache).toEqual({});
    });
  });

  describe("RedisCache", () => {
    let redCache: RedisCache;

    beforeEach(() => {
      jest.clearAllMocks();

      redCache = new RedisCache("redis://localhost:6739");
    });

    test("initialses & creates new redis client", () => {
      expect(Redis).toHaveBeenCalled();
      expect(Redis).toHaveBeenCalledWith("redis://localhost:6739");

      expect(redCache.client).toBeTruthy();
      expect(redCache.keyPrefix).toEqual("fm-riot-api-");
    });

    test("set -> calls client.setex with key, ttl and value", async () => {
      const mockedRedisSetex = redCache.client.setex as jest.Mock;
      mockedRedisSetex.mockResolvedValue("OK");

      await expect(redCache.set("key", { a: 1 }, 5000)).resolves.toEqual("OK");
      expect(mockedRedisSetex).toHaveBeenCalledWith(
        "fm-riot-api-key",
        5,
        JSON.stringify({ a: 1 })
      );
    });

    test("get -> returns NULL if value is not present in cache", async () => {
      const mockedRedisGet = redCache.client.get as jest.Mock;
      mockedRedisGet.mockResolvedValue(null);

      await expect(redCache.get("key")).resolves.toBeNull();
      expect(mockedRedisGet).toHaveBeenCalledWith("fm-riot-api-key");
    });

    test("get -> returns JSON value if present in cache", async () => {
      const mockedRedisGet = redCache.client.get as jest.Mock;
      mockedRedisGet.mockResolvedValue(JSON.stringify({ a: 1 }));

      await expect(redCache.get("key")).resolves.toEqual({ a: 1 });
    });

    test("flush -> calls client.flushdb and empties our cache", async () => {
      const mockedRedisFlush = redCache.client.flushdb as jest.Mock;
      mockedRedisFlush.mockResolvedValue("OK");

      await expect(redCache.flush()).resolves.toEqual("OK");
      expect(mockedRedisFlush).toHaveBeenCalled();
    });
  });
});
