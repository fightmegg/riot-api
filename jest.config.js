// require("leaked-handles");

process.env.RIOT_LOL_API_KEY = "661771";

module.exports = {
  preset: "ts-jest",
  verbose: true,
  collectCoverageFrom: ["src/**/*.{js,jsx,ts,tsx}"],
  coverageDirectory: ".jest/coverage",
  cacheDirectory: ".jest/cache",
  setupFilesAfterEnv: ["jest-extended"],
  testEnvironment: "node",
};
