import lifecyclesService from '../../server/src/services/lifecycles';

describe('loadLifecycleMethods', () => {
  let strapi: any;
  let subscribe: jest.Mock;
  let getAlgoliaClient: jest.Mock;
  let afterUpdateAndCreate: jest.Mock;
  let afterDeleteOneOrMany: jest.Mock;

  beforeEach(() => {
    subscribe = jest.fn();
    getAlgoliaClient = jest.fn().mockResolvedValue({});
    afterUpdateAndCreate = jest.fn();
    afterDeleteOneOrMany = jest.fn();

    strapi = {
      config: {
        get: jest.fn().mockReturnValue({
          applicationId: 'APP_ID',
          apiKey: 'API_KEY',
          indexPrefix: 'dev_',
          contentTypes: [
            { name: 'api::article.article', index: 'articles' },
          ],
        }),
      },
      plugin: jest.fn().mockReturnValue({
        service: jest.fn().mockReturnValue({
          getAlgoliaClient,
          afterUpdateAndCreate,
          afterDeleteOneOrMany,
        }),
      }),
      contentTypes: { 'api::article.article': {} },
      db: { lifecycles: { subscribe } },
    } as any;
  });

  test('returns early when no contentTypes in config', async () => {
    strapi.config.get = jest.fn().mockReturnValue({
      applicationId: 'APP_ID',
      apiKey: 'API_KEY',
    });

    await lifecyclesService({ strapi }).loadLifecycleMethods();

    expect(subscribe).not.toHaveBeenCalled();
  });

  test('skips content types not registered in Strapi', async () => {
    strapi.contentTypes = {};

    await lifecyclesService({ strapi }).loadLifecycleMethods();

    expect(subscribe).not.toHaveBeenCalled();
  });

  test('subscribes to lifecycle hooks for known content types', async () => {
    await lifecyclesService({ strapi }).loadLifecycleMethods();

    expect(subscribe).toHaveBeenCalledWith(
      expect.objectContaining({ models: ['api::article.article'] })
    );
  });

  test('builds index name from indexPrefix and custom index', async () => {
    await lifecyclesService({ strapi }).loadLifecycleMethods();

    const subscribeArg = subscribe.mock.calls[0][0];
    await subscribeArg.afterCreate({
      result: {
        id: 1,
        documentId: 'doc',
        publishedAt: '2024-01-01',
      },
      model: { uid: 'api::article.article' },
      params: {},
    });

    const callArgs = (afterUpdateAndCreate as jest.Mock).mock
      .calls[0];
    expect(callArgs[7]).toBe('dev_articles');
    expect(callArgs[8]).toBe('api::article.article');
  });

  test('builds index name from content type name when no index configured', async () => {
    strapi.config.get = jest.fn().mockReturnValue({
      applicationId: 'APP_ID',
      apiKey: 'API_KEY',
      indexPrefix: 'dev_',
      contentTypes: [{ name: 'api::article.article' }],
    });

    await lifecyclesService({ strapi }).loadLifecycleMethods();

    const subscribeArg = subscribe.mock.calls[0][0];
    await subscribeArg.afterCreate({
      result: {
        id: 1,
        documentId: 'doc',
        publishedAt: '2024-01-01',
      },
      model: { uid: 'api::article.article' },
      params: {},
    });

    const callArgs = (afterUpdateAndCreate as jest.Mock).mock
      .calls[0];
    expect(callArgs[7]).toBe('dev_api::article.article');
    expect(callArgs[8]).toBe('api::article.article');
  });

  test('afterDelete callback calls afterDeleteOneOrMany with many=false', async () => {
    await lifecyclesService({ strapi }).loadLifecycleMethods();

    const subscribeArg = subscribe.mock.calls[0][0];
    const event = { params: { where: { id: '1' } } };
    await subscribeArg.afterDelete(event);

    expect(afterDeleteOneOrMany).toHaveBeenCalledWith(
      event,
      expect.any(String),
      expect.anything(),
      expect.any(String),
      false
    );
  });

  test('afterDeleteMany callback calls afterDeleteOneOrMany with many=true', async () => {
    await lifecyclesService({ strapi }).loadLifecycleMethods();

    const subscribeArg = subscribe.mock.calls[0][0];
    const event = {
      params: { where: { $and: [{ id: { $in: ['1', '2'] } }] } },
    };
    await subscribeArg.afterDeleteMany(event);

    expect(afterDeleteOneOrMany).toHaveBeenCalledWith(
      event,
      expect.any(String),
      expect.anything(),
      expect.any(String),
      true
    );
  });
});
