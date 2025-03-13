import type { Core } from '@strapi/strapi';
import type { algoliasearch as algoliasearchType } from 'algoliasearch';
import { transformNullToBoolean } from '../../../utils/utils';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default ({ strapi }: { strapi: Core.Strapi }) => ({
  getAlgoliaClient: async (applicationId: string, apiKey: string) => {
    const { algoliasearch } = await import('algoliasearch');
    return algoliasearch(applicationId, apiKey);
  },
  createOrDeleteObjects: async (
    objectsToSave: any[],
    objectsIdsToDelete: string[],
    algoliaClient: ReturnType<typeof algoliasearchType>,
    indexName: string,
    transformToBooleanFields: string[] = []
  ) => {
    const strapiAlgolia = strapi.plugin('strapi-algolia');
    const utilsService = strapiAlgolia.service('utils');

    if (objectsIdsToDelete.length) {
      const chunkedObjectsToDelete = utilsService.getChunksRequests(
        objectsIdsToDelete
      );

      for (const chunk of chunkedObjectsToDelete) {
        await algoliaClient.deleteObjects({
          indexName,
          objectIDs: chunk,
        });
      }
    }

    if (objectsToSave.length) {
      const chunkedObjectsToSave: any[][] = utilsService.getChunksRequests(objectsToSave);
      for (const chunk of chunkedObjectsToSave) {

        const cleanedChunk = chunk.map((c) =>
          transformNullToBoolean(c, transformToBooleanFields)
        );
        cleanedChunk.forEach((x) => delete x._strapiContentType)
        await algoliaClient.saveObjects({
          indexName,
          objects: cleanedChunk,
        });
      }
    }
  },
});
