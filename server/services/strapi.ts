import { Common, Entity, Strapi } from '@strapi/strapi';
import { SearchIndex } from 'algoliasearch';
import { HookEvent } from '../../utils/event';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default ({ strapi }: { strapi: Strapi }) => ({
  getStrapiObject: async (event: HookEvent, populate: any) => {
    const strapiAlgolia = strapi.plugin('strapi-algolia');
    const algoliaService = strapiAlgolia.service('algolia');

    const { model } = event;
    const modelUid = model.uid as Common.UID.ContentType;
    const entryId = algoliaService.getEntryId(event);

    if (!entryId) {
      throw new Error(`No entry id found in event.`);
    }

    const strapiObject = await strapi.entityService?.findOne(
      modelUid,
      entryId,
      { populate }
    );

    if (!strapiObject) {
      throw new Error(
        `No entry found for ${modelUid} with ID ${entryId}`
      );
    }
    return strapiObject;
  },
  afterUpdateAndCreate: async (
    _events: any[],
    populate: any,
    idPrefix: string,
    algoliaIndex: SearchIndex
  ) => {
    const strapiAlgolia = strapi.plugin('strapi-algolia');
    const algoliaService = strapiAlgolia.service('algolia');
    const strapiService = strapiAlgolia.service('strapi');

    const objectsToSave: any[] = [];
    const objectsIdsToDelete: string[] = [];
    const events = _events as HookEvent[];

    for (const event of events) {
      try {
        const entryId = `${idPrefix}${algoliaService.getEntryId(
          event
        )}`;
        const strapiObject = await strapiService.getStrapiObject(
          event,
          populate
        );

        if (strapiObject.publishedAt === null) {
          const indexExist = await algoliaIndex.exists();
          if (indexExist) {
            objectsIdsToDelete.push(entryId);
          }
        } else if (strapiObject.publishedAt !== null) {
          objectsToSave.push({
            objectID: entryId,
            ...strapiObject,
          });
        }
      } catch (error) {
        console.error(
          `Error while updating Algolia index: ${JSON.stringify(
            error
          )}`
        );
      }

      await algoliaService.createOrDeleteObjects(
        objectsToSave,
        objectsIdsToDelete,
        algoliaIndex
      );
    }
  },
  afterDeleteOneOrMany: async (
    _event: any,
    idPrefix: string,
    algoliaIndex: SearchIndex,
    many: boolean
  ) => {
    try {
      const event = _event as HookEvent;
      const strapiIds = many
        ? event?.params?.where?.['$and'][0]?.id['$in']
        : [event.params.where.id];
      const objectIDs = strapiIds.map(
        (id: string) => `${idPrefix}${id}`
      );

      await algoliaIndex.deleteObjects(objectIDs);
    } catch (error) {
      console.error(
        `Error while deleting object(s) from Algolia index: ${error}`
      );
    }
  },
  getFakeEvents: (
    model: { uid: string; singularName: string },
    articles: { id: Entity.ID }[]
  ) =>
    articles.map((article) => ({
      action: 'afterCreate',
      model: {
        uid: model.uid,
        singularName: model.singularName,
      },
      params: {
        where: {
          id: article.id,
        },
      },
      result: {
        id: article.id,
      },
    })),
});
