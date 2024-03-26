import { Strapi } from '@strapi/strapi';
import { SearchIndex } from 'algoliasearch';
import { HookEvent } from '../../utils/event';
import algoliasearch from 'algoliasearch';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default ({ strapi }: { strapi: Strapi }) => ({
  getChunksRequests: (array: any[], chunkSize = 600) => {
    if (chunkSize <= 0) {
      throw new Error('chunkSize must be greater than 0');
    }

    const chunks: any[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }

    return chunks;
  },
  getAlgoliaClient: (applicationId: string, apiKey: string) => {
    return algoliasearch(applicationId, apiKey);
  },
  createOrDeleteObjects: async (
    objectsToSave: any[],
    objectsIdsToDelete: string[],
    algoliaIndex: SearchIndex
  ) => {
    const algoliaService = strapi
      .plugin('strapi-algolia')
      .service('algolia');

    if (objectsIdsToDelete.length) {
      const chunkedObjectsToDelete = algoliaService.getChunksRequests(
        objectsIdsToDelete
      );

      for (const chunk of chunkedObjectsToDelete) {
        await algoliaIndex.deleteObjects(chunk);
      }
    }

    if (objectsToSave.length) {
      const chunkedObjectsToSave =
        algoliaService.getChunksRequests(objectsToSave);

      for (const chunk of chunkedObjectsToSave) {
        await algoliaIndex.saveObjects(chunk);
      }
    }
  },
  getEntryId: (event: HookEvent) =>
    event?.result?.id ?? event?.params?.where?.id,
});
