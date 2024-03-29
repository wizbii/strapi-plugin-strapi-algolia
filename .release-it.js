'use strict';

const fs = require('fs');

const commitTemplate = fs.readFileSync('commit.hbs').toString();

module.exports = {
  git: {
    commitMessage: 'v${version}',
    tagName: 'v${version}',
  },
  plugins: {
    '@release-it/bumper': {
      out: 'package.json',
    },
    '@release-it/conventional-changelog': {
      writerOpts: {
        commitPartial: commitTemplate,
      },
      infile: 'CHANGELOG.md',
      preset: {
        name: 'conventionalcommits',
        types: [
          { type: 'feat', section: 'Features' },
          { type: 'fix', section: 'Bug Fixes' },
          { type: 'chore', hidden: 'Chores' },
          { type: 'docs', section: 'Docs' },
          { type: 'style', section: 'Styles' },
          { type: 'refactor', section: 'Refactor' },
          { type: 'perf', hidden: 'true' },
          { type: 'test', section: 'Tests' },
          { type: 'build', hidden: 'true' },
          { type: 'ci', section: 'CI' },
          { type: 'revert', hidden: 'true' },
        ],
      },
      ignoreRecommendedBump: 'true',
    },
  },
  npm: {
    publish: false,
  },
};
