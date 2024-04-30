import { Strapi } from '@strapi/strapi';
import { SearchIndex } from 'algoliasearch';
import { transformNullToBoolean } from '../../utils/utils';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default ({ strapi }: { strapi: Strapi }) => ({
  getAlgoliaClient: async (applicationId: string, apiKey: string) => {
    const algoliasearch = await import('algoliasearch').then(
      (a) => a.default
    );
    const client = algoliasearch(applicationId, apiKey);
    return client;
  },
  createOrDeleteObjects: async (
    objectsToSave: any[],
    objectsIdsToDelete: string[],
    algoliaIndex: SearchIndex,
    transformToBooleanFields: string[] = []
  ) => {
    const strapiAlgolia = strapi.plugin('strapi-algolia');
    const utilsService = strapiAlgolia.service('utils');

    if (objectsIdsToDelete.length) {
      const chunkedObjectsToDelete = utilsService.getChunksRequests(
        objectsIdsToDelete
      );

      for (const chunk of chunkedObjectsToDelete) {
        await algoliaIndex.deleteObjects(chunk);
      }
    }

    if (objectsToSave.length) {
      const chunkedObjectsToSave: any[][] =
        utilsService.getChunksRequests(objectsToSave);

      for (const chunk of chunkedObjectsToSave) {
        const cleanedChunk = chunk.map((c) =>
          transformNullToBoolean(c, transformToBooleanFields)
        );
        await algoliaIndex.saveObjects(cleanedChunk);
      }
    }
  },
});
