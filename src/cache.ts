import {
  Collection,
  Db,
  Document,
  MongoClient,
  MongoClientOptions,
} from "mongodb";
import { Redis, RedisOptions } from "ioredis";

export interface ICache {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: object, ttl: number): Promise<string>;
  flush(): Promise<string>;
}

export class MongoCache implements ICache {
  readonly client: MongoClient;
  readonly dbName: string = "riot-api";
  readonly collectionName: string = "cache";
  readonly keyIndexName: string = "riot-api-cache-key-index";
  readonly ttlIndexName: string = "riot-api-cache-ttl-index";

  private _connectPromise: Promise<void>;
  private _db: Db | null = null;
  private _collection: Collection<Document> | null = null;

  constructor(url: string, options?: MongoClientOptions | undefined) {
    this.client = new MongoClient(url, options);
    this._connectPromise = this.client
      .connect()
      .then(() => this.initDatabase());
  }

  private async initDatabase() {
    const dbList = await this.client.db().admin().listDatabases();
    if (!dbList.databases.some((db) => db.name === this.dbName)) {
      this.client.db(this.dbName);
    }

    this._db = this.client.db(this.dbName);

    const collections = await this._db.listCollections().toArray();
    if (!collections.some((col) => col.name === this.collectionName)) {
      await this._db.createCollection(this.collectionName);
    }

    this._collection = this._db.collection(this.collectionName);

    const indexes = await this._collection.indexes();

    if (!indexes.some((index) => index.name === this.keyIndexName)) {
      await this._collection.createIndex(
        { key: 1 },
        { unique: true, name: this.keyIndexName }
      );
    }

    if (!indexes.some((index) => index.name === this.ttlIndexName)) {
      await this._collection.createIndex(
        { expiresAt: 1 },
        { expireAfterSeconds: 0, name: this.ttlIndexName }
      );
    }
  }

  async get<T>(key: string): Promise<T | null> {
    await this._connectPromise;

    if (!this._collection)
      throw new Error("MongoDB collection not initialized");

    const document = (await this._collection.findOne<T>({ key })) as
      | (T & { key: string; value: object })
      | null;
    if (!document) return null;

    return document.value as T;
  }

  async set(key: string, value: object, ttl: number): Promise<"OK" | "Error"> {
    await this._connectPromise;

    if (!this._collection)
      throw new Error("MongoDB collection not initialized");

    let expiresAt: Date | null = null;
    if (ttl) {
      expiresAt = new Date(Date.now() + ttl);
    }

    const result = await this._collection.updateOne(
      { key },
      { $set: { value, key, expiresAt } },
      { upsert: true }
    );

    return result.acknowledged ? "OK" : "Error";
  }

  async flush(): Promise<string> {
    await this._connectPromise;

    if (!this._collection)
      throw new Error("MongoDB collection not initialized");

    await this._collection.deleteMany({});
    return "OK";
  }
}

export class RedisCache implements ICache {
  readonly client: Redis;
  readonly keyPrefix: string = "fm-riot-api-";

  constructor(redisClientOpts: RedisOptions | string) {
    this.client = new Redis(redisClientOpts as RedisOptions);
  }

  async get<T>(key: string): Promise<T | null> {
    const payload = await this.client.get(this.keyPrefix + key);
    return payload ? JSON.parse(payload) : null;
  }

  async set(key: string, value: object, ttl: number): Promise<string> {
    return await this.client.setex(
      this.keyPrefix + key,
      ttl / 1000,
      JSON.stringify(value)
    );
  }

  async flush(): Promise<string> {
    return this.client.flushdb();
  }
}

export class MemoryCache implements ICache {
  cache: { [key: string]: { expires: number; value: object } };

  constructor() {
    this.cache = {};
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.cache[key]) return null;
    if (Date.now() > this.cache[key].expires) {
      delete this.cache[key];
      return null;
    }
    return this.cache[key].value as T;
  }

  async set(key: string, value: object, ttl: number): Promise<"OK"> {
    this.cache[key] = {
      expires: ttl ? Date.now() + ttl : 0,
      value,
    };
    return "OK";
  }

  async flush(): Promise<string> {
    this.cache = {};
    return "OK";
  }
}
