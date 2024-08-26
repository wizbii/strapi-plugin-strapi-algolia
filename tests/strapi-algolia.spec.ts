import algoliaService from '../server/services/algolia';
import strapiService from '../server/services/strapi';
import utilsService from '../server/services/utils';
import { validateConfig } from '../utils/validate';

describe('strapi-algolia plugin', () => {
  describe('validate configuration', () => {
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
              hideFields: ['field-hide'],
              transformToBooleanFiels: ['field-bool'],
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
              hideFields: ['field-hide'],
              transformToBooleanFiels: ['field-bool'],
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

  describe('algolia service', () => {
    let strapi: any;

    beforeEach(() => {
      strapi = {
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
                [{ id: 3 }, { id: 4, toto: null, tata: null }],
              ]),
          }),
        }),
      };
    });

    test('createOrDeleteObjects utils', async () => {
      const algoliaClient = {
        deleteObjects: jest.fn(),
        saveObjects: jest.fn(),
      };
      const indexName = 'index-name';

      await algoliaService({ strapi }).createOrDeleteObjects(
        [
          { id: 1 },
          { id: 2 },
          { id: 3 },
          { id: 4, toto: null, tata: null },
        ],
        ['5', '6', '7', '8'],
        algoliaClient as any,
        indexName,
        ['toto']
      );

      expect(algoliaClient.deleteObjects).toHaveBeenCalledTimes(2);
      expect(algoliaClient.deleteObjects).toHaveBeenNthCalledWith(1, {
        indexName,
        objectIDs: ['5', '6'],
      });
      expect(algoliaClient.deleteObjects).toHaveBeenNthCalledWith(2, {
        objectIDs: ['7', '8'],
        indexName,
      });

      expect(algoliaClient.saveObjects).toHaveBeenCalledTimes(2);
      expect(algoliaClient.saveObjects).toHaveBeenNthCalledWith(1, {
        indexName,
        objects: [{ id: 1 }, { id: 2 }],
      });
      expect(algoliaClient.saveObjects).toHaveBeenNthCalledWith(2, {
        indexName,
        objects: [{ id: 3 }, { id: 4, toto: false, tata: null }],
      });
    });
  });

  describe('strapi service', () => {
    describe('getStrapiObject utils', () => {
      let strapi: any;
      const fakeArticle = {
        article: {
          id: 'id',
          title: 'title',
          content: 'content',
          publishedAt: null,
        },
        hide: 'hide',
      } as any;
      const fakeArticleWithoutHide = {
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
              getEntryId: utilsService({ strapi }).getEntryId,
              filterProperties: utilsService({ strapi })
                .filterProperties,
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
          strapiService({ strapi }).getStrapiObject(
            {
              model: {
                uid: 'api::contentType.contentType',
              },
            } as any,
            '*',
            []
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
          strapiService({ strapi }).getStrapiObject(
            {
              result: {
                id: 'id',
              },
              model: {
                uid: 'api::contentType.contentType',
              },
            } as any,
            '*',
            []
          )
        ).rejects.toThrow(
          'No entry found for api::contentType.contentType with ID id'
        );
      });

      test('return a strapi object found with result', async () => {
        const obj = await strapiService({
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
          '*',
          []
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
        const obj = await strapiService({
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
          '*',
          []
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

      test('return a strapi object with hidden fields found with params', async () => {
        const obj = await strapiService({
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
          '*',
          ['hide']
        );

        expect(obj).toEqual(fakeArticleWithoutHide);
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

  describe('utils service', () => {
    test('getEntryId utils', () => {
      expect(
        utilsService({ strapi: {} as any }).getEntryId({} as any)
      ).toBeUndefined();
      expect(
        utilsService({ strapi: {} as any }).getEntryId({
          result: {
            id: 'idresult',
          },
        } as any)
      ).toEqual('idresult');
      expect(
        utilsService({ strapi: {} as any }).getEntryId({
          params: {
            where: { id: 'idParams' },
          },
        } as any)
      ).toEqual('idParams');
    });

    test('filterProperties utils', () => {
      const obj = {
        id: 'id',
        title: 'title',
        content: 'content',
        hide: 'hide',
      };

      expect(
        utilsService({ strapi: {} as any }).filterProperties(obj, [
          'hide',
        ])
      ).toEqual({
        id: 'id',
        title: 'title',
        content: 'content',
      });
    });

    test('getChunksRequests utils', () => {
      expect(
        utilsService({ strapi: {} as any }).getChunksRequests(
          [...Array(5).keys()],
          2
        )
      ).toEqual([[0, 1], [2, 3], [4]]);
      expect(
        utilsService({ strapi: {} as any }).getChunksRequests(
          [...Array(6).keys()],
          2
        )
      ).toEqual([
        [0, 1],
        [2, 3],
        [4, 5],
      ]);
      expect(() =>
        utilsService({ strapi: {} as any }).getChunksRequests(
          [...Array(6).keys()],
          0
        )
      ).toThrow('chunkSize must be greater than 0');
    });
  });
});
