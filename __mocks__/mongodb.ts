export const mockFindOne = jest.fn();
export const mockUpdateOne = jest.fn();
export const mockDeleteMany = jest.fn();
export const mockCreateIndex = jest.fn();
export const mockIndexes = jest.fn(() => Promise.resolve([]));
export const mockListCollections = jest.fn(() => ({
  toArray: jest.fn(() => Promise.resolve([])),
}));
export const mockCreateCollection = jest.fn();
export const mockCollection = jest.fn(() => ({
  findOne: mockFindOne,
  updateOne: mockUpdateOne,
  deleteMany: mockDeleteMany,
  createIndex: mockCreateIndex,
  indexes: mockIndexes,
}));
export const mockListDatabases = jest.fn(() =>
  Promise.resolve({ databases: [] })
);
export const mockAdmin = jest.fn(() => ({
  listDatabases: mockListDatabases,
}));
export const mockDb = jest.fn(() => ({
  admin: mockAdmin,
  listCollections: mockListCollections,
  createCollection: mockCreateCollection,
  collection: mockCollection,
}));
export const mockConnect = jest.fn(() => Promise.resolve());

export const MongoClient = jest.fn(() => ({
  connect: mockConnect,
  db: mockDb,
}));
