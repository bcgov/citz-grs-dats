export default {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  moduleNameMapper: {
    "^@renderer/(.*)$": "<rootDir>/src/renderer/$1"
  },
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  }
};
