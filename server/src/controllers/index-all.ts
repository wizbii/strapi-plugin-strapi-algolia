import type { Core, UID } from '@strapi/strapi';
import Koa from 'koa';
import { StrapiAlgoliaConfig } from '../../../utils/config';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
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
      transformerCallback
    } = strapi.config.get('plugin::strapi-algolia') as StrapiAlgoliaConfig;

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
      hideFields = [],
      transformToBooleanFields = []
    } = contentType;

    const indexName = `${indexPrefix}${index ?? name}`;

    const allLocales =
      await strapi.plugins?.i18n?.services?.locales?.find();
    const localeFilter = allLocales?.map(
      (locale: any) => locale.code
    );
    const findManyBaseOptions = {
      populate,
    };
    const findManyOptions = localeFilter
      ? {
          ...findManyBaseOptions,
          locale: localeFilter,
        }
      : { ...findManyBaseOptions };

    // Can't fetch draft & published articles in the same query (no status filter = draft only)
    const publishedArticlesStrapi =
      (await strapi
        .documents(name as UID.ContentType)
        .findMany({ ...findManyOptions, status: 'published' })) ?? [];
    const draftArticlesStrapi =
      (await strapi
        .documents(name as UID.ContentType)
        .findMany({ ...findManyOptions, status: 'draft' })) ?? [];
    // Concatenate all published articles + any draft versions which aren't published
    // Filtering out any draft articles which have a published version
    const articlesStrapi = publishedArticlesStrapi.concat(
      draftArticlesStrapi.filter(
        (draft: any) =>
          !publishedArticlesStrapi.some(
            (published: any) => published.id === draft.id
          )
      )
    );
 


    await strapiService.afterUpdateAndCreateAlreadyPopulate(
      body.name,
      articlesStrapi,
      idPrefix,
      client,
      indexName,
      transformToBooleanFields,
      hideFields,
      transformerCallback
    );

    return ctx.send({
      message: `Indexing articles type ${name} to index ${indexName}`,
    });
  },
});
