import algoliaServiceUtils from '../server/services/algolia';
import strapiServiceUtils from '../server/services/strapi';
import { HookEvent } from '../utils/event';
import { validateConfig } from '../utils/validate';

describe('strapi-algolia plugin', () => {
  describe('validate utils', () => {
    test('config validation', () => {
      expect(() => validateConfig({})).toThrow(
        /Algolia plugin configuration error:/
      );

      expect(() =>
        validateConfig({
          applicationId: 'APP_ID_XXXX',
          apiKey: 'API_KEY_XXXX',
          indexPrefix: 'prefix_',
          contentTypes: [],
        })
      ).not.toThrow();

      expect(() =>
        validateConfig({
          applicationId: 'APP_ID_XXXX',
          apiKey: 'API_KEY_XXXX',
          indexPrefix: 'prefix_',
          contentTypes: [
            {
              name: 'api::contentType.contentType',
              index: 'indexName',
              idPrefix: 'id-prefix_',
              populate: { field: 'field' },
            },
          ],
        })
      ).not.toThrow();

      expect(() =>
        validateConfig({
          applicationId: 'APP_ID_XXXX',
          apiKey: 'API_KEY_XXXX',
          indexPrefix: 'prefix_',
          contentTypes: [
            {
              name: 'api::contentType.contentType',
              idPrefix: 'id-prefix_',
              populate: { field: 'field' },
            },
          ],
        })
      ).not.toThrow();

      expect(() =>
        validateConfig({
          applicationId: 'APP_ID_XXXX',
          apiKey: 'API_KEY_XXXX',
          indexPrefix: 'prefix_',
          contentTypes: [
            {
              name: 'api::contentType.contentType',
              populate: { field: 'field' },
            },
          ],
        })
      ).not.toThrow();

      expect(() =>
        validateConfig({
          applicationId: 'APP_ID_XXXX',
          apiKey: 'API_KEY_XXXX',
          indexPrefix: 'prefix_',
          contentTypes: [
            {
              name: 'api::contentType.contentType',
            },
          ],
        })
      ).not.toThrow();

      expect(() =>
        validateConfig({
          applicationId: 'APP_ID_XXXX',
          apiKey: 'API_KEY_XXXX',
          indexPrefix: 'prefix_',
          contentTypes: [
            {
              index: 'indexName',
              idPrefix: 'id-prefix_',
              populate: { field: 'field' },
            },
          ],
        })
      ).toThrow(
        'Algolia plugin configuration error: contentTypes[0].name is a required field'
      );

      expect(() =>
        validateConfig({
          applicationId: 'APP_ID_XXXX',
          apiKey: 'API_KEY_XXXX',
          indexPrefix: 'prefix_',
          contentTypes: [{}],
        })
      ).toThrow(
        'Algolia plugin configuration error: contentTypes[0].name is a required field'
      );

      expect(() =>
        validateConfig({
          applicationId: 'APP_ID_XXXX',
          apiKey: 'API_KEY_XXXX',
          contentTypes: [
            {
              name: 'api::contentType.contentType',
              index: 'indexName',
              idPrefix: 'id-prefix_',
              populate: { field: 'field' },
            },
          ],
        })
      ).not.toThrow();

      expect(() =>
        validateConfig({
          apiKey: 'API_KEY_XXXX',
          indexPrefix: 'prefix_',
          contentTypes: [
            {
              name: 'api::contentType.contentType',
              index: 'indexName',
              idPrefix: 'id-prefix_',
              populate: { field: 'field' },
            },
          ],
        })
      ).toThrow(
        'Algolia plugin configuration error: applicationId is a required field'
      );

      expect(() =>
        validateConfig({
          applicationId: 'APP_ID_XXXX',
          indexPrefix: 'prefix_',
          contentTypes: [
            {
              name: 'api::contentType.contentType',
              index: 'indexName',
              idPrefix: 'id-prefix_',
              populate: { field: 'field' },
            },
          ],
        })
      ).toThrow(
        'Algolia plugin configuration error: apiKey is a required field'
      );
    });
  });

  describe('algolia utils', () => {
    test('getEntryId utils', () => {
      expect(
        algoliaServiceUtils({ strapi: {} as any }).getEntryId(
          {} as any
        )
      ).toBeUndefined();
      expect(
        algoliaServiceUtils({ strapi: {} as any }).getEntryId({
          result: {
            id: 'idresult',
          },
        } as any)
      ).toEqual('idresult');
      expect(
        algoliaServiceUtils({ strapi: {} as any }).getEntryId({
          params: {
            where: { id: 'idParams' },
          },
        } as any)
      ).toEqual('idParams');
    });

    test('getChunksRequests utils', () => {
      expect(
        algoliaServiceUtils({ strapi: {} as any }).getChunksRequests(
          [...Array(5).keys()],
          2
        )
      ).toEqual([[0, 1], [2, 3], [4]]);
      expect(
        algoliaServiceUtils({ strapi: {} as any }).getChunksRequests(
          [...Array(6).keys()],
          2
        )
      ).toEqual([
        [0, 1],
        [2, 3],
        [4, 5],
      ]);
      expect(() =>
        algoliaServiceUtils({ strapi: {} as any }).getChunksRequests(
          [...Array(6).keys()],
          0
        )
      ).toThrow('chunkSize must be greater than 0');
    });

    test('createOrDeleteObjects utils', async () => {
      const strapi: any = {
        plugin: jest.fn().mockReturnValue({
          service: jest.fn().mockReturnValue({
            getChunksRequests: jest
              .fn()
              .mockReturnValueOnce([
                ['5', '6'],
                ['7', '8'],
              ])
              .mockReturnValueOnce([
                [{ id: 1 }, { id: 2 }],
                [{ id: 3 }, { id: 4 }],
              ]),
          }),
        }),
      };

      const algoliaIndex = {
        deleteObjects: jest.fn(),
        saveObjects: jest.fn(),
      };

      await algoliaServiceUtils({ strapi }).createOrDeleteObjects(
        [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
        ['5', '6', '7', '8'],
        algoliaIndex as any
      );

      expect(algoliaIndex.deleteObjects).toHaveBeenCalledTimes(2);
      expect(algoliaIndex.deleteObjects).toHaveBeenNthCalledWith(1, [
        '5',
        '6',
      ]);
      expect(algoliaIndex.deleteObjects).toHaveBeenNthCalledWith(2, [
        '7',
        '8',
      ]);

      expect(algoliaIndex.saveObjects).toHaveBeenCalledTimes(2);
      expect(algoliaIndex.saveObjects).toHaveBeenNthCalledWith(1, [
        { id: 1 },
        { id: 2 },
      ]);
      expect(algoliaIndex.saveObjects).toHaveBeenNthCalledWith(2, [
        { id: 3 },
        { id: 4 },
      ]);
    });
  });

  describe('strapi utils', () => {
    describe('getStrapiObject utils', () => {
      let strapi: any;
      const fakeArticle = {
        article: {
          id: 'id',
          title: 'title',
          content: 'content',
          publishedAt: null,
        },
      } as any;

      beforeEach(() => {
        strapi = {
          plugin: jest.fn().mockReturnValue({
            service: jest.fn().mockReturnValue({
              getEntryId: (event: HookEvent) =>
                event?.result?.id ?? event?.params?.where?.id,
            }),
          }),
          entityService: {
            findOne: jest
              .fn()
              .mockReturnValue(Promise.resolve(fakeArticle)),
          },
        } as any;
      });

      test('throw error when entry id not found', async () => {
        expect(
          strapiServiceUtils({ strapi }).getStrapiObject(
            {
              model: {
                uid: 'api::contentType.contentType',
              },
            } as any,
            true
          )
        ).rejects.toThrow('No entry id found in event.');
      });

      test('throw error when object not found', async () => {
        strapi = {
          ...strapi,
          entityService: {
            findOne: jest
              .fn()
              .mockReturnValue(Promise.resolve(undefined)),
          },
        } as any;

        expect(
          strapiServiceUtils({ strapi }).getStrapiObject(
            {
              result: {
                id: 'id',
              },
              model: {
                uid: 'api::contentType.contentType',
              },
            } as any,
            true
          )
        ).rejects.toThrow(
          'No entry found for api::contentType.contentType with ID id'
        );
      });

      test('return a strapi object found with result', async () => {
        const obj = await strapiServiceUtils({
          strapi,
        }).getStrapiObject(
          {
            result: {
              id: 'id',
            },
            model: {
              uid: 'api::contentType.contentType',
            },
          } as any,
          '*'
        );

        expect(obj).toEqual(fakeArticle);
        expect(strapi.entityService.findOne).toHaveBeenCalledWith(
          'api::contentType.contentType',
          'id',
          {
            populate: '*',
          }
        );
      });

      test('return a strapi object found with params', async () => {
        const obj = await strapiServiceUtils({
          strapi,
        }).getStrapiObject(
          {
            params: {
              where: {
                id: 'id',
              },
            },
            model: {
              uid: 'api::contentType.contentType',
            },
          } as any,
          '*'
        );

        expect(obj).toEqual(fakeArticle);
        expect(strapi.entityService.findOne).toHaveBeenCalledWith(
          'api::contentType.contentType',
          'id',
          {
            populate: '*',
          }
        );
      });
    });
  });
});
