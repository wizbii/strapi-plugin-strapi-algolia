/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
/** @type {import('ts-jest').JestConfigWithTsJest} */
const { defaults: tsjPreset } = require('ts-jest/presets');

process.env = Object.assign(process.env, {
  STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE: 'fr',
});

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
  testPathIgnorePatterns: ['/node_modules/', '.tmp', '.cache'],
  testTimeout: 15000,
};
