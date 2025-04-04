'use strict';

const fs = require('fs');

const commitTemplate = fs.readFileSync('commit.hbs').toString();

module.exports = {
  git: {
    commitMessage: 'v${version}',
    tagName: 'v${version}',
  },
  plugins: {
    '@release-it/conventional-changelog': {
      writerOpts: { commitPartial: commitTemplate },
      infile: 'CHANGELOG.md',
      preset: { name: 'conventionalcommits' },
      ignoreRecommendedBump: 'true',
    },
  },
  npm: { publish: false },
};
