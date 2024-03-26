import { Strapi } from '@strapi/strapi';
import Koa from 'koa';
import { StrapiAlgoliaConfig } from '../../utils/config';

export default ({ strapi }: { strapi: Strapi }) => ({
  async index(
    ctx: Koa.Context & {
      request: {
        body?: unknown;
        rawBody: string;
      };
    }
  ) {
    const {
      indexPrefix = '',
      contentTypes,
      applicationId,
      apiKey,
      locales: globalLocale = ['fr', 'en'],
    } = strapi.config.get(
      'plugin.strapi-algolia'
    ) as StrapiAlgoliaConfig;

    if (!contentTypes) {
      return;
    }

    const strapiAlgolia = strapi.plugin('strapi-algolia');
    const algoliaService = strapiAlgolia.service('algolia');
    const strapiService = strapiAlgolia.service('strapi');

    const client = await algoliaService.getAlgoliaClient(
      applicationId,
      apiKey
    );
    const body = ctx.request.body as any;

    if (!body.name) {
      return ctx.throw(400, `Missing name in body`);
    }

    const contentType = contentTypes.find(
      (contentType) => contentType.name === body.name
    );

    if (!contentType) {
      return ctx.throw(
        400,
        `Content type not found in config with ${body.name}`
      );
    }

    const {
      name,
      index,
      idPrefix = '',
      populate = '*',
      locales = globalLocale,
    } = contentType;

    const indexName = `${indexPrefix}${index ?? name}`;
    const algoliaIndex = client.initIndex(indexName);

    const localeFilter = locales ?? ['fr', 'en'];
    const articles = await strapi.entityService?.findMany(
      name as any,
      {
        populate,
        filters: {
          locale: localeFilter,
        },
      }
    );

    await strapiService.afterUpdateAndCreateAlreadyPopulate(
      articles,
      idPrefix,
      algoliaIndex
    );

    return ctx.send({
      message: `Indexing articles type ${name} to index ${indexName}`,
    });
  },
});
