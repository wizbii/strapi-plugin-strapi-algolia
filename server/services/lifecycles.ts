import { Strapi } from '@strapi/strapi';
import { StrapiAlgoliaConfig } from '../../utils/config';

export default ({ strapi }: { strapi: Strapi }) => ({
  async loadLifecycleMethods() {
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

    const client = await algoliaService.getAlgoliaClient(
      applicationId,
      apiKey
    );

    for (const contentType of contentTypes) {
      const {
        name,
        index,
        idPrefix = '',
        populate = true,
      } = contentType;

      if (strapi.contentTypes[name]) {
        const indexName = `${indexPrefix}${index ?? name}`;
        const algoliaIndex = client.initIndex(indexName);

        strapi.db?.lifecycles.subscribe({
          models: [name],
          afterCreate: async (event) => {
            await strapiService.afterUpdateAndCreate(
              [event],
              populate,
              idPrefix,
              algoliaIndex
            );
          },
          afterUpdate: async (event) => {
            await strapiService.afterUpdateAndCreate(
              [event],
              populate,
              idPrefix,
              algoliaIndex
            );
          },
          afterDelete: async (event) => {
            await strapiService.afterDeleteOneOrMany(
              event,
              idPrefix,
              algoliaIndex,
              false
            );
          },
          afterDeleteMany: async (event) => {
            await strapiService.afterDeleteOneOrMany(
              event,
              idPrefix,
              algoliaIndex,
              true
            );
          },
        });
      }
    }
  },
});
