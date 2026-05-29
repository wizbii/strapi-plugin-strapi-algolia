import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores([
    '**/.DS_Store',
    '**/.AppleDouble',
    '**/.LSOverride',
    '**/Icon',
    '**/.Spotlight-V100',
    '**/.Trashes',
    '**/._*',
    '**/*~',
    '**/Thumbs.db',
    '**/ehthumbs.db',
    '**/Desktop.ini',
    '**/$RECYCLE.BIN/',
    '**/*.cab',
    '**/*.msi',
    '**/*.msm',
    '**/*.msp',
    '**/*.7z',
    '**/*.csv',
    '**/*.dat',
    '**/*.dmg',
    '**/*.gz',
    '**/*.iso',
    '**/*.jar',
    '**/*.rar',
    '**/*.tar',
    '**/*.zip',
    '**/*.com',
    '**/*.class',
    '**/*.dll',
    '**/*.exe',
    '**/*.o',
    '**/*.seed',
    '**/*.so',
    '**/*.swo',
    '**/*.swp',
    '**/*.swn',
    '**/*.swm',
    '**/*.out',
    '**/*.pid',
    '**/.tmp',
    '**/*.log',
    '**/*.sql',
    '**/*.sqlite',
    '**/*.sqlite3',
    '**/*#',
    '**/ssl',
    '**/.idea',
    '**/nbproject',
    'public/uploads/*',
    '!public/uploads/.gitkeep',
    '**/lib-cov',
    '**/lcov.info',
    '**/pids',
    '**/logs',
    '**/results',
    '**/node_modules',
    '**/.node_history',
    '**/testApp',
    '**/coverage',
    '**/.env',
    '**/license.txt',
    '**/exports',
    '**/*.cache',
    '**/build',
    '**/dist',
    '**/.strapi-updater.json',
    '**/types',
    '**/.devops',
    'public/sitemap',
    '**/documentation',
    '**/.strapi',
    '**/CHANGELOG.md',
    '.commitlintrc.js',
    '.release-it.js',
  ]),
  {
    extends: compat.extends(
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended'
    ),

    plugins: {
      '@typescript-eslint': typescriptEslint,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
      },

      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },

    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
]);
