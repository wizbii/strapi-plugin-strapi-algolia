import { Strapi } from '@strapi/strapi';
import { SearchIndex } from 'algoliasearch';

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
    algoliaIndex: SearchIndex
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
      const chunkedObjectsToSave =
        utilsService.getChunksRequests(objectsToSave);

      for (const chunk of chunkedObjectsToSave) {
        await algoliaIndex.saveObjects(chunk);
      }
    }
  },
});
