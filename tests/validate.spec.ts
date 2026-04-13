import { validateConfig } from '../utils/validate';

describe('validate configuration', () => {
  test('config validation', () => {
    expect(() => validateConfig({})).toThrow(
      /Algolia plugin configuration error:/
    );

    expect(() =>
      validateConfig({
        applicationId: 'APP_ID_XXXX',
        apiKey: 'API_KEY_XXXX',
        indexPrefix: 'prefix_',
        contentTypes: [],
      })
    ).not.toThrow();

    expect(() =>
      validateConfig({
        applicationId: 'APP_ID_XXXX',
        apiKey: 'API_KEY_XXXX',
        indexPrefix: 'prefix_',
        contentTypes: [
          {
            name: 'api::contentType.contentType',
            index: 'indexName',
            idPrefix: 'id-prefix_',
            populate: { field: 'field' },
            hideFields: ['field-hide'],
            transformToBooleanFiels: ['field-bool'],
          },
        ],
      })
    ).not.toThrow();

    expect(() =>
      validateConfig({
        applicationId: 'APP_ID_XXXX',
        apiKey: 'API_KEY_XXXX',
        indexPrefix: 'prefix_',
        contentTypes: [
          {
            name: 'api::contentType.contentType',
            idPrefix: 'id-prefix_',
            populate: { field: 'field' },
            hideFields: ['field-hide'],
            transformToBooleanFiels: ['field-bool'],
          },
        ],
      })
    ).not.toThrow();

    expect(() =>
      validateConfig({
        applicationId: 'APP_ID_XXXX',
        apiKey: 'API_KEY_XXXX',
        indexPrefix: 'prefix_',
        contentTypes: [
          {
            name: 'api::contentType.contentType',
            populate: { field: 'field' },
          },
        ],
      })
    ).not.toThrow();

    expect(() =>
      validateConfig({
        applicationId: 'APP_ID_XXXX',
        apiKey: 'API_KEY_XXXX',
        indexPrefix: 'prefix_',
        contentTypes: [
          {
            name: 'api::contentType.contentType',
          },
        ],
      })
    ).not.toThrow();

    expect(() =>
      validateConfig({
        applicationId: 'APP_ID_XXXX',
        apiKey: 'API_KEY_XXXX',
        indexPrefix: 'prefix_',
        contentTypes: [
          {
            index: 'indexName',
            idPrefix: 'id-prefix_',
            populate: { field: 'field' },
          },
        ],
      })
    ).toThrow(
      'Algolia plugin configuration error: contentTypes[0].name is a required field'
    );

    expect(() =>
      validateConfig({
        applicationId: 'APP_ID_XXXX',
        apiKey: 'API_KEY_XXXX',
        indexPrefix: 'prefix_',
        contentTypes: [{}],
      })
    ).toThrow(
      'Algolia plugin configuration error: contentTypes[0].name is a required field'
    );

    expect(() =>
      validateConfig({
        applicationId: 'APP_ID_XXXX',
        apiKey: 'API_KEY_XXXX',
        contentTypes: [
          {
            name: 'api::contentType.contentType',
            index: 'indexName',
            idPrefix: 'id-prefix_',
            populate: { field: 'field' },
          },
        ],
      })
    ).not.toThrow();

    expect(() =>
      validateConfig({
        apiKey: 'API_KEY_XXXX',
        indexPrefix: 'prefix_',
        contentTypes: [
          {
            name: 'api::contentType.contentType',
            index: 'indexName',
            idPrefix: 'id-prefix_',
            populate: { field: 'field' },
          },
        ],
      })
    ).toThrow(
      'Algolia plugin configuration error: applicationId is a required field'
    );

    expect(() =>
      validateConfig({
        applicationId: 'APP_ID_XXXX',
        indexPrefix: 'prefix_',
        contentTypes: [
          {
            name: 'api::contentType.contentType',
            index: 'indexName',
            idPrefix: 'id-prefix_',
            populate: { field: 'field' },
          },
        ],
      })
    ).toThrow(
      'Algolia plugin configuration error: apiKey is a required field'
    );
  });
});
