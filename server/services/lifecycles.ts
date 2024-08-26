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
        populate = '*',
        hideFields = [],
        transformToBooleanFields = [],
      } = contentType;

      if (strapi.contentTypes[name]) {
        const indexName = `${indexPrefix}${index ?? name}`;

        strapi.db?.lifecycles.subscribe({
          models: [name],
          afterCreate: async (event) => {
            await strapiService.afterUpdateAndCreate(
              [event],
              populate,
              hideFields,
              transformToBooleanFields,
              idPrefix,
              client,
              indexName
            );
          },
          afterUpdate: async (event) => {
            await strapiService.afterUpdateAndCreate(
              [event],
              populate,
              hideFields,
              transformToBooleanFields,
              idPrefix,
              client,
              indexName
            );
          },
          afterDelete: async (event) => {
            await strapiService.afterDeleteOneOrMany(
              event,
              idPrefix,
              client,
              indexName,
              false
            );
          },
          afterDeleteMany: async (event) => {
            await strapiService.afterDeleteOneOrMany(
              event,
              idPrefix,
              client,
              indexName,
              true
            );
          },
        });
      }
    }
  },
});
