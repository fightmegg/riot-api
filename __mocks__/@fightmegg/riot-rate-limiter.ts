const mockExecute = jest.fn();

const { PlatformId, METHODS, HOST } = jest.requireActual(
  "@fightmegg/riot-rate-limiter"
);

export { PlatformId, METHODS, HOST };

export const RiotRateLimiter = jest.fn(() => {
  return {
    execute: mockExecute,
  };
});
