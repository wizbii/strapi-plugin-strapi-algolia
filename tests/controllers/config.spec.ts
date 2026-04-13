import configController from '../../server/src/controllers/config';

describe('contentTypes controller', () => {
  let strapi: any;
  let ctx: any;

  beforeEach(() => {
    ctx = { body: undefined };
    strapi = { config: { get: jest.fn() } } as any;
  });

  test('returns early without setting ctx.body when no contentTypes in config', async () => {
    strapi.config.get = jest.fn().mockReturnValue({});

    await configController({ strapi }).contentTypes(ctx as any);

    expect(ctx.body).toBeUndefined();
  });

  test('sets ctx.body with mapped content type names', async () => {
    strapi.config.get = jest.fn().mockReturnValue({
      contentTypes: [
        { name: 'api::article.article' },
        { name: 'api::post.post' },
      ],
    });

    await configController({ strapi }).contentTypes(ctx as any);

    expect(ctx.body).toEqual({
      contentTypes: ['api::article.article', 'api::post.post'],
    });
  });
});
