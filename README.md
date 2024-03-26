# Strapi plugin strapi-algolia

A strapi plugin to sync your strapi content with Algolia.

## Getting started

### 1. Installation

#### With Yarn

```bash
yarn add strapi-plugin-strapi-algolia
```

##### With NPM

```bash
npm install --save strapi-plugin-strapi-algolia
```

### 2. Setup environment variables

```bash
ALGOLIA_ADMIN_KEY=your_algolia_app_id
ALGOLIA_APP_ID=your_algolia_api_key
```

### 3. Configure the plugin

#### In Javascript

Add the following code to `./config/plugins.js`

```javascript
'use strict';

module.exports = ({ env }) => ({
  // ...
  'strapi-algolia': {
    enabled: true,
    config: {
      apiKey: env('ALGOLIA_ADMIN_KEY'),
      applicationId: env('ALGOLIA_APP_ID'),
      contentTypes: [
        { name: 'api::article.article' },
        // ...
      ],
    },
  },
});
```

#### In Typescript

Add the following code to `./config/plugins.ts`

```typescript
export default ({ env }) => ({
  // ...
  'strapi-algolia': {
    enabled: true,
    config: {
      apiKey: env('ALGOLIA_ADMIN_KEY'),
      applicationId: env('ALGOLIA_APP_ID'),
      contentTypes: [
        { name: 'api::article.article' },
        // ...
      ],
    },
  },
});
```

#### All configurations options

| Property              | Description                                                                             | Type                                                                  | Default value                         |
| --------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------- |
| applicationId         | Algolia application ID                                                                  | string **(required)**                                                 |                                       |
| apiKey                | Algolia API Key                                                                         | string **(required)**                                                 |                                       |
| indexPrefix           | Prefix for the Algolia index                                                            | string                                                                | `` `${strapi.config.environment}_` `` |
| contentTypes          | Array of content types needed to be indexed                                             | Array\<object\> **(required)**                                        |                                       |
| contentTypes.name     | NAme of the content type                                                                | string **(required)**                                                 |                                       |
| contentTypes.index    | Algolia index for the current content type                                              | string                                                                |                                       |
| contentTypes.idPrefix | Prefix for the item id                                                                  | string                                                                |                                       |
| contentTypes.populate | Which fields needed to be indexed on Algolia, by default all the properties are indexed | [object](https://docs.strapi.io/dev-docs/api/query-engine/populating) | `true` = All fields                   |
