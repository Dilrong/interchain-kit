/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        babelConfig: false,
        tsconfig: "tsconfig.json",
      },
    ],
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  transformIgnorePatterns: ["/node_modules/(?!multiformats|uint8arrays)/"],
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  modulePathIgnorePatterns: ["dist/*"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["__tests__/helpers/*"],
  // moduleNameMapper: {
  //   "^uint8arrays$": "<rootDir>../../node_modules/uint8arrays/cjs/src", // 强制使用 CommonJS 版本
  //   "^multiformats$": "<rootDir>../../node_modules/multiformats/cjs/src", // 强制使用 CommonJS 版本
  // },
};
