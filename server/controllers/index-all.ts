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
    } = strapi.config.get(
      'plugin.strapi-algolia'
    ) as StrapiAlgoliaConfig;

    if (!contentTypes) {
      return;
    }

    const strapiAlgolia = strapi.plugin('strapi-algolia');
    const algoliaService = strapiAlgolia.service('algolia');
    const strapiService = strapiAlgolia.service('strapi');
    const utilsService = strapiAlgolia.service('utils');

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
      hideFields = [],
      transformToBooleanFields = [],
    } = contentType;

    const indexName = `${indexPrefix}${index ?? name}`;
    const algoliaIndex = client.initIndex(indexName);

    const allLocales =
      await strapi.plugins?.i18n?.services?.locales?.find();
    const localeFilter = allLocales?.map(
      (locale: any) => locale.code
    );
    const findManyBaseOptions = { populate };
    const findManyOptions = localeFilter
      ? {
          ...findManyBaseOptions,
          locale: localeFilter,
        }
      : { ...findManyBaseOptions };

    const articlesStrapi = await strapi.entityService?.findMany(
      name as any,
      findManyOptions
    );
    const articles = (articlesStrapi ?? []).map((article: any) =>
      utilsService.filterProperties(article, hideFields)
    );

    await strapiService.afterUpdateAndCreateAlreadyPopulate(
      articles,
      idPrefix,
      algoliaIndex,
      transformToBooleanFields
    );

    return ctx.send({
      message: `Indexing articles type ${name} to index ${indexName}`,
    });
  },
});
