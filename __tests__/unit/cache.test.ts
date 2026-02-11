import { MemoryCache, MongoCache, RedisCache } from "../../src/cache";
import { Redis } from "ioredis";

jest.mock("ioredis", () => ({
  Redis: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    setex: jest.fn(),
    flushdb: jest.fn(),
  })),
}));

jest.mock("mongodb");

import {
  mockConnect,
  mockCreateCollection,
  mockCreateIndex,
  mockDeleteMany,
  mockFindOne,
  mockIndexes,
  mockListCollections,
  mockListDatabases,
  mockUpdateOne,
} from "../../__mocks__/mongodb";

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
    const mockedRedis = jest.mocked(Redis);

    beforeEach(() => {
      jest.clearAllMocks();

      redCache = new RedisCache("redis://localhost:6739");
    });

    test("initialses & creates new redis client", () => {
      expect(mockedRedis).toHaveBeenCalled();
      expect(mockedRedis).toHaveBeenCalledWith("redis://localhost:6739");

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

  describe("MongoCache", () => {
    let mongoCache: MongoCache;

    beforeEach(() => {
      jest.clearAllMocks();

      mockConnect.mockResolvedValue(undefined);
      mockListDatabases.mockResolvedValue({ databases: [] });
      mockListCollections.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      });
      mockCreateCollection.mockResolvedValue(undefined);
      mockIndexes.mockResolvedValue([]);
      mockCreateIndex.mockResolvedValue("riot-api-cache-key-index");

      mongoCache = new MongoCache("mongodb://localhost:27017");
    });

    test("initialises & creates new mongo client", () => {
      expect(mongoCache.client).toBeTruthy();
      expect(mongoCache.dbName).toEqual("riot-api");
      expect(mongoCache.collectionName).toEqual("cache");
      expect(mongoCache.keyIndexName).toEqual("riot-api-cache-key-index");
    });

    test("connects to mongodb on initialization", async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockConnect).toHaveBeenCalled();
    });

    test("set -> calls collection.updateOne with key, value and upsert", async () => {
      mockUpdateOne.mockResolvedValue({ acknowledged: true });

      await expect(mongoCache.set("key", { a: 1 }, 5000)).resolves.toEqual(
        "OK"
      );
      expect(mockUpdateOne).toHaveBeenCalledWith(
        { key: "key" },
        {
          $set: expect.objectContaining({
            value: { a: 1 },
            key: "key",
            expiresAt: expect.any(Date),
          }),
        },
        { upsert: true }
      );
    });

    test("set -> returns Error when update is not acknowledged", async () => {
      mockUpdateOne.mockResolvedValue({ acknowledged: false });

      await expect(mongoCache.set("key", { a: 1 }, 5000)).resolves.toEqual(
        "Error"
      );
    });

    test("get -> returns NULL if value is not present in cache", async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(mongoCache.get("key")).resolves.toBeNull();
      expect(mockFindOne).toHaveBeenCalledWith({ key: "key" });
    });

    test("get -> returns value without key property if present in cache", async () => {
      mockFindOne.mockResolvedValue({ key: "key", value: { a: 1, b: 2 } });

      await expect(mongoCache.get("key")).resolves.toEqual({ a: 1, b: 2 });
    });

    test("flush -> calls collection.deleteMany and empties the cache", async () => {
      mockDeleteMany.mockResolvedValue({ deletedCount: 5 });

      await expect(mongoCache.flush()).resolves.toEqual("OK");
      expect(mockDeleteMany).toHaveBeenCalledWith({});
    });
  });
});
