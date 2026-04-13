# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Build the plugin (outputs to dist/)
npm run build

# Watch mode for local development
npm run watch
npm run watch:link   # watch + symlink to a local Strapi project

# Run all tests
npm run test

# Run a single test file
npx jest tests/strapi-algolia.spec.ts --runInBand

# TypeScript type-checking (server and admin separately)
npm run test:ts:back   # server/tsconfig.json
npm run test:ts:front  # admin/tsconfig.json

# Lint (ESLint + Prettier)
npm run lint

# Format files
npm run format

# Verify plugin structure (strapi-plugin verify)
npm run verify
```

## Architecture

This is a **Strapi v5 plugin** that automatically syncs Strapi content to Algolia. It follows the standard `@strapi/sdk-plugin` dual-package layout:

- `server/` — Node.js plugin code loaded by Strapi server
- `admin/` — React code injected into the Strapi admin panel
- `utils/` — Shared TypeScript types and pure utilities used by both sides

### Server data flow

**Bootstrap** (`server/src/bootstrap.ts`): Registers admin permissions, then calls `lifecycles.loadLifecycleMethods()`.

**Lifecycle sync** (`server/src/services/lifecycles.ts`): For each configured content type, subscribes to Strapi DB lifecycle hooks (`afterCreate`, `afterUpdate`, `afterDelete`, `afterDeleteMany`). On create/update, it fetches the published document and saves it to Algolia. On delete, it removes it.

**Bulk "index all"** (`server/src/controllers/index-all.ts`): Fetches all published + unpublished-only documents across all locales, then delegates to `strapi.afterUpdateAndCreateAlreadyPopulate`. Exposed via `POST /strapi-algolia/index-all-articles` (admin-only).

**Services** (`server/src/services/`):

- `algolia.ts` — Wraps Algolia client; handles chunked `saveObjects` / `deleteObjects` (600 records/chunk)
- `strapi.ts` — Fetches Strapi documents by `documentId`, applies `hideFields`/`transformerCallback`, coordinates save vs. delete logic
- `lifecycles.ts` — Registers DB lifecycle subscribers at bootstrap
- `utils.ts` — Pure helpers: `filterProperties`, `getEntryId`, `getChunksRequests`

### Index name resolution

`indexName = ${indexPrefix}${contentType.index ?? contentType.name}`

Default `indexPrefix` is `${strapi.config.environment}_`.

### Object ID

`objectID = ${idPrefix}${entry.id}` — prefixed numeric Strapi ID.

### Null-to-boolean transform

`transformNullToBoolean` (in `utils/utils.ts`) recursively replaces `null` with `false` for fields listed in `transformToBooleanFields`. Applied just before saving to Algolia.

### Draft vs. published

Only published documents are indexed. In lifecycle hooks, events with `publishedAt === null` are skipped or deleted. In `findOne` calls, `status: 'published'` is always set explicitly.

### Admin panel

`admin/src/index.ts` injects `ListViewInjectedComponent` into the content-manager list view. The component renders `IndexAllButton` only for content types configured in the plugin and only when the user has the `plugin::strapi-algolia.index-all` RBAC permission.

### Config validation

`utils/validate.ts` uses Yup to validate the plugin config. Required fields: `applicationId`, `apiKey`. The `StrapiAlgoliaConfig` type is in `utils/config.d.ts`.

### Tests

Tests live in `tests/strapi-algolia.spec.ts` and `utils/utils.spec.ts`. They use Jest + ts-jest and mock the Strapi context object directly — no real Strapi or Algolia instance needed.
