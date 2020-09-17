export const mockSetex = jest.fn();

export const mockGet = jest.fn();

export const mockFlush = jest.fn();

const mock = jest.fn(() => {
  return { get: mockGet, setex: mockSetex, flushdb: mockFlush };
});

export default mock;
