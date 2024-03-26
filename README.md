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

| Property              | Description                       | Type                                                                  | Default value |
| --------------------- | --------------------------------- | --------------------------------------------------------------------- | ------------- |
| applicationId         | Algolia application ID (required) | string                                                                |               |
| apiKey                | Algolia API Key (required)        | string                                                                |               |
| indexPrefix           | Text                              | string                                                                |               |
| contentTypes          | Text                              | Array<object>                                                         |               |
| contentTypes.name     | Text (required)                   | string                                                                |               |
| contentTypes.index    | Text                              | string                                                                |               |
| contentTypes.idPrefix | Text                              | string                                                                |               |
| contentTypes.populate | Text                              | [object](https://docs.strapi.io/dev-docs/api/entity-service/populate) | All fields    |
