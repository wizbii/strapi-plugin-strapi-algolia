import indexAllController from '../../server/src/controllers/index-all';

describe('index-all controller', () => {
  let strapi: any;
  let ctx: any;
  let getAlgoliaClient: jest.Mock;
  let afterUpdateAndCreateAlreadyPopulate: jest.Mock;
  let findMany: jest.Mock;

  const baseConfig = {
    applicationId: 'APP_ID',
    apiKey: 'API_KEY',
    indexPrefix: 'dev_',
    contentTypes: [
      { name: 'api::article.article', index: 'articles' },
    ],
  };

  beforeEach(() => {
    getAlgoliaClient = jest.fn().mockResolvedValue({});
    afterUpdateAndCreateAlreadyPopulate = jest.fn();
    findMany = jest.fn().mockResolvedValue([]);

    strapi = {
      config: { get: jest.fn().mockReturnValue(baseConfig) },
      plugin: jest.fn().mockReturnValue({
        service: jest.fn().mockReturnValue({
          getAlgoliaClient,
          afterUpdateAndCreateAlreadyPopulate,
        }),
      }),
      documents: jest.fn().mockReturnValue({ findMany }),
      plugins: {},
    } as any;

    ctx = {
      request: { body: { name: 'api::article.article' } },
      throw: jest.fn(),
      send: jest.fn(),
    };
  });

  test('returns early when no contentTypes in config', async () => {
    strapi.config.get = jest.fn().mockReturnValue({});

    await indexAllController({ strapi }).index(ctx as any);

    expect(getAlgoliaClient).not.toHaveBeenCalled();
  });

  test('calls ctx.throw 400 when body.name is missing', async () => {
    ctx.request.body = {};

    await indexAllController({ strapi }).index(ctx as any);

    expect(ctx.throw).toHaveBeenCalledWith(
      400,
      expect.stringContaining('Missing name')
    );
  });

  test('calls ctx.throw 400 when content type not found in config', async () => {
    ctx.request.body = { name: 'api::unknown.unknown' };

    await indexAllController({ strapi }).index(ctx as any);

    expect(ctx.throw).toHaveBeenCalledWith(
      400,
      expect.stringContaining('Content type not found')
    );
  });

  test('deduplicates articles: published takes priority over draft with same id', async () => {
    const published = {
      id: 1,
      publishedAt: '2024-01-01',
      title: 'P',
    };
    const draftOnly = { id: 2, publishedAt: null, title: 'D' };
    const duplicateDraft = { id: 1, publishedAt: null, title: 'DP' };

    findMany
      .mockResolvedValueOnce([published])
      .mockResolvedValueOnce([duplicateDraft, draftOnly]);

    await indexAllController({ strapi }).index(ctx as any);

    expect(afterUpdateAndCreateAlreadyPopulate).toHaveBeenCalledWith(
      'api::article.article',
      [published, draftOnly],
      expect.any(String),
      expect.anything(),
      expect.any(String),
      expect.any(Array),
      expect.any(Array),
      undefined
    );
  });

  test('includes locale filter when i18n plugin is available', async () => {
    strapi.plugins = {
      i18n: {
        services: {
          locales: {
            find: jest
              .fn()
              .mockResolvedValue([{ code: 'fr' }, { code: 'en' }]),
          },
        },
      },
    };

    await indexAllController({ strapi }).index(ctx as any);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ locale: ['fr', 'en'] })
    );
  });

  test('does not include locale filter when i18n plugin is absent', async () => {
    await indexAllController({ strapi }).index(ctx as any);

    expect(findMany).not.toHaveBeenCalledWith(
      expect.objectContaining({ locale: expect.anything() })
    );
  });

  test('sends success response after indexing', async () => {
    await indexAllController({ strapi }).index(ctx as any);

    expect(ctx.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('api::article.article'),
      })
    );
  });
});
