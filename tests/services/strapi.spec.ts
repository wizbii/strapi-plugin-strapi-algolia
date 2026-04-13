import strapiService from '../../server/src/services/strapi';
import utilsService from '../../server/src/services/utils';

describe('strapi service', () => {
  describe('getStrapiObject', () => {
    let strapi: any;
    const fakeArticle = {
      article: {
        id: 123,
        documentId: 'id',
        title: 'title',
        content: 'content',
        publishedAt: null,
      },
      hide: 'hide',
    } as any;
    const fakeArticleWithoutHide = {
      article: {
        id: 123,
        documentId: 'id',
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
        documents: jest.fn().mockReturnValue({
          findOne: jest
            .fn()
            .mockReturnValue(Promise.resolve(fakeArticle)),
        }),
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
        documents: jest.fn().mockReturnValue({
          findOne: jest
            .fn()
            .mockReturnValue(Promise.resolve(undefined)),
        }),
      } as any;

      expect(
        strapiService({ strapi }).getStrapiObject(
          {
            result: {
              id: 123,
              documentId: 'id',
            },
            model: {
              uid: 'api::contentType.contentType',
            },
          } as any,
          '*',
          []
        )
      ).rejects.toThrow(
        'No entry found for api::contentType.contentType with ID 123'
      );
    });

    test('return a strapi object found with result', async () => {
      const obj = await strapiService({ strapi }).getStrapiObject(
        {
          result: {
            id: 123,
            documentId: 'id',
          },
          model: {
            uid: 'api::contentType.contentType',
          },
        } as any,
        '*',
        []
      );

      expect(obj).toEqual(fakeArticle);
      expect(strapi.documents).toHaveBeenCalledWith(
        'api::contentType.contentType'
      );
      expect(strapi.documents().findOne).toHaveBeenCalledWith({
        documentId: 'id',
        populate: '*',
        status: 'published',
      });
    });

    test('return a strapi object found with params', async () => {
      const obj = await strapiService({ strapi }).getStrapiObject(
        {
          params: {
            where: {
              id: 123,
            },
          },
          model: {
            uid: 'api::contentType.contentType',
          },
          result: {
            documentId: 'id',
          },
        } as any,
        '*',
        []
      );

      expect(obj).toEqual(fakeArticle);
      expect(strapi.documents).toHaveBeenCalledWith(
        'api::contentType.contentType'
      );
      expect(strapi.documents().findOne).toHaveBeenCalledWith({
        documentId: 'id',
        populate: '*',
        status: 'published',
      });
    });

    test('return a strapi object with hidden fields found with params', async () => {
      const obj = await strapiService({ strapi }).getStrapiObject(
        {
          params: {
            where: {
              id: 123,
              status: 'published',
            },
          },
          model: {
            uid: 'api::contentType.contentType',
          },
          result: {
            documentId: 'id',
          },
        } as any,
        '*',
        ['hide']
      );

      expect(obj).toEqual(fakeArticleWithoutHide);
      expect(strapi.documents).toHaveBeenCalledWith(
        'api::contentType.contentType'
      );
      expect(strapi.documents().findOne).toHaveBeenCalledWith({
        documentId: 'id',
        populate: '*',
        status: 'published',
      });
    });
  });

  describe('afterDeleteOneOrMany', () => {
    test('deletes a single object with id prefix', async () => {
      const algoliaClient = { deleteObjects: jest.fn() };

      await strapiService({ strapi: {} as any }).afterDeleteOneOrMany(
        { params: { where: { id: '123' } } } as any,
        'prefix_',
        algoliaClient as any,
        'my-index',
        false
      );

      expect(algoliaClient.deleteObjects).toHaveBeenCalledWith({
        indexName: 'my-index',
        objectIDs: ['prefix_123'],
      });
    });

    test('deletes multiple objects with id prefix', async () => {
      const algoliaClient = { deleteObjects: jest.fn() };

      await strapiService({ strapi: {} as any }).afterDeleteOneOrMany(
        {
          params: {
            where: { $and: [{ id: { $in: ['1', '2', '3'] } }] },
          },
        } as any,
        'prefix_',
        algoliaClient as any,
        'my-index',
        true
      );

      expect(algoliaClient.deleteObjects).toHaveBeenCalledWith({
        indexName: 'my-index',
        objectIDs: ['prefix_1', 'prefix_2', 'prefix_3'],
      });
    });

    test('handles errors gracefully without throwing', async () => {
      const algoliaClient = {
        deleteObjects: jest
          .fn()
          .mockRejectedValue(new Error('Algolia error')),
      };

      await expect(
        strapiService({ strapi: {} as any }).afterDeleteOneOrMany(
          { params: { where: { id: '123' } } } as any,
          '',
          algoliaClient as any,
          'my-index',
          false
        )
      ).resolves.not.toThrow();
    });
  });

  describe('afterUpdateAndCreateAlreadyPopulate', () => {
    let strapi: any;
    let algoliaClient: any;
    let createOrDeleteObjects: jest.Mock;

    beforeEach(() => {
      createOrDeleteObjects = jest.fn();
      strapi = {
        plugin: jest.fn().mockReturnValue({
          service: jest.fn().mockReturnValue({
            filterProperties: utilsService({
              strapi: {} as any,
            }).filterProperties,
            createOrDeleteObjects,
          }),
        }),
      } as any;
      algoliaClient = {
        deleteObjects: jest.fn(),
        saveObjects: jest.fn(),
      };
    });

    test('adds unpublished articles to delete list', async () => {
      const articles = [{ id: 1, publishedAt: null }];

      await strapiService({
        strapi,
      }).afterUpdateAndCreateAlreadyPopulate(
        'api::article.article',
        articles,
        'prefix_',
        algoliaClient,
        'my-index',
        [],
        []
      );

      expect(createOrDeleteObjects).toHaveBeenCalledWith(
        [],
        ['prefix_1'],
        algoliaClient,
        'my-index',
        []
      );
    });

    test('adds published articles to save list with id prefix', async () => {
      const articles = [
        {
          id: 1,
          title: 'Article',
          publishedAt: '2024-01-01',
          secret: 'hidden',
        },
      ];

      await strapiService({
        strapi,
      }).afterUpdateAndCreateAlreadyPopulate(
        'api::article.article',
        articles,
        'prefix_',
        algoliaClient,
        'my-index',
        [],
        ['secret']
      );

      expect(createOrDeleteObjects).toHaveBeenCalledWith(
        [
          {
            objectID: 'prefix_1',
            id: 1,
            title: 'Article',
            publishedAt: '2024-01-01',
          },
        ],
        [],
        algoliaClient,
        'my-index',
        []
      );
    });

    test('applies transformerCallback to published articles', async () => {
      const articles = [
        { id: 1, title: 'Article', publishedAt: '2024-01-01' },
      ];
      const transformerCallback = jest.fn().mockResolvedValue({
        id: 1,
        transformedTitle: 'Transformed',
      });

      await strapiService({
        strapi,
      }).afterUpdateAndCreateAlreadyPopulate(
        'api::article.article',
        articles,
        '',
        algoliaClient,
        'my-index',
        [],
        [],
        transformerCallback
      );

      expect(transformerCallback).toHaveBeenCalledWith(
        'api::article.article',
        articles[0]
      );
      expect(createOrDeleteObjects).toHaveBeenCalledWith(
        [{ objectID: '1', id: 1, transformedTitle: 'Transformed' }],
        [],
        algoliaClient,
        'my-index',
        []
      );
    });

    test('continues processing remaining articles after an error', async () => {
      const goodArticle = {
        id: 2,
        title: 'Good',
        publishedAt: '2024-01-01',
      };
      const transformerCallback = jest
        .fn()
        .mockRejectedValueOnce(new Error('Transform error'))
        .mockResolvedValue({ id: 2, title: 'Good' });

      await strapiService({
        strapi,
      }).afterUpdateAndCreateAlreadyPopulate(
        'api::article.article',
        [{ id: 1, publishedAt: '2024-01-01' }, goodArticle],
        '',
        algoliaClient,
        'my-index',
        [],
        [],
        transformerCallback
      );

      expect(createOrDeleteObjects).toHaveBeenCalledWith(
        [{ objectID: '2', id: 2, title: 'Good' }],
        [],
        algoliaClient,
        'my-index',
        []
      );
    });
  });

  describe('afterUpdateAndCreate', () => {
    const fakeArticle = {
      id: 123,
      documentId: 'doc-id',
      title: 'Test Article',
      publishedAt: '2024-01-01',
      secret: 'hidden',
    };

    let strapi: any;
    let algoliaClient: any;
    let createOrDeleteObjects: jest.Mock;
    let getStrapiObject: jest.Mock;

    beforeEach(() => {
      createOrDeleteObjects = jest.fn();
      getStrapiObject = jest.fn().mockResolvedValue(fakeArticle);
      strapi = {
        plugin: jest.fn().mockReturnValue({
          service: jest.fn().mockReturnValue({
            getEntryId: utilsService({ strapi: {} as any })
              .getEntryId,
            filterProperties: utilsService({ strapi: {} as any })
              .filterProperties,
            createOrDeleteObjects,
            getStrapiObject,
          }),
        }),
      } as any;
      algoliaClient = {
        deleteObjects: jest.fn(),
        saveObjects: jest.fn(),
      };
    });

    test('skips draft events (publishedAt falsy)', async () => {
      const events = [
        {
          result: {
            id: 123,
            documentId: 'doc-id',
            publishedAt: null,
          },
          model: { uid: 'api::article.article' },
          params: {},
        },
      ];

      await strapiService({ strapi }).afterUpdateAndCreate(
        events as any,
        '*',
        [],
        [],
        null,
        '',
        algoliaClient,
        'my-index',
        'api::article.article'
      );

      expect(getStrapiObject).not.toHaveBeenCalled();
      expect(createOrDeleteObjects).toHaveBeenCalledWith(
        [],
        [],
        algoliaClient,
        'my-index',
        []
      );
    });

    test('saves published object when event ID matches strapiObject ID', async () => {
      const events = [
        {
          result: {
            id: 123,
            documentId: 'doc-id',
            publishedAt: '2024-01-01',
          },
          model: { uid: 'api::article.article' },
          params: {},
        },
      ];

      await strapiService({ strapi }).afterUpdateAndCreate(
        events as any,
        '*',
        [],
        [],
        null,
        'prefix_',
        algoliaClient,
        'my-index',
        'api::article.article'
      );

      expect(createOrDeleteObjects).toHaveBeenCalledWith(
        [{ objectID: 'prefix_123', ...fakeArticle }],
        [],
        algoliaClient,
        'my-index',
        []
      );
    });

    test('skips object when event ID does not match strapiObject ID', async () => {
      getStrapiObject.mockResolvedValue({ ...fakeArticle, id: 999 });

      const events = [
        {
          result: {
            id: 123,
            documentId: 'doc-id',
            publishedAt: '2024-01-01',
          },
          model: { uid: 'api::article.article' },
          params: {},
        },
      ];

      await strapiService({ strapi }).afterUpdateAndCreate(
        events as any,
        '*',
        [],
        [],
        null,
        '',
        algoliaClient,
        'my-index',
        'api::article.article'
      );

      expect(createOrDeleteObjects).toHaveBeenCalledWith(
        [],
        [],
        algoliaClient,
        'my-index',
        []
      );
    });

    test('applies sync transformerCallback to saved object', async () => {
      const transformed = { id: 123, customField: 'Transformed' };
      const transformerCallback = jest
        .fn()
        .mockReturnValue(transformed);

      const events = [
        {
          result: {
            id: 123,
            documentId: 'doc-id',
            publishedAt: '2024-01-01',
          },
          model: { uid: 'api::article.article' },
          params: {},
        },
      ];

      await strapiService({ strapi }).afterUpdateAndCreate(
        events as any,
        '*',
        [],
        [],
        transformerCallback,
        '',
        algoliaClient,
        'my-index',
        'api::article.article'
      );

      expect(transformerCallback).toHaveBeenCalledWith(
        'api::article.article',
        fakeArticle
      );
      expect(createOrDeleteObjects).toHaveBeenCalledWith(
        [{ objectID: '123', ...transformed }],
        [],
        algoliaClient,
        'my-index',
        []
      );
    });

    test('applies async transformerCallback to saved object', async () => {
      const transformed = {
        id: 123,
        asyncField: 'Async Transformed',
      };
      const transformerCallback = jest
        .fn()
        .mockResolvedValue(transformed);

      const events = [
        {
          result: {
            id: 123,
            documentId: 'doc-id',
            publishedAt: '2024-01-01',
          },
          model: { uid: 'api::article.article' },
          params: {},
        },
      ];

      await strapiService({ strapi }).afterUpdateAndCreate(
        events as any,
        '*',
        [],
        [],
        transformerCallback,
        '',
        algoliaClient,
        'my-index',
        'api::article.article'
      );

      expect(createOrDeleteObjects).toHaveBeenCalledWith(
        [{ objectID: '123', ...transformed }],
        [],
        algoliaClient,
        'my-index',
        []
      );
    });

    test('filters hideFields from saved object', async () => {
      const events = [
        {
          result: {
            id: 123,
            documentId: 'doc-id',
            publishedAt: '2024-01-01',
          },
          model: { uid: 'api::article.article' },
          params: {},
        },
      ];

      await strapiService({ strapi }).afterUpdateAndCreate(
        events as any,
        '*',
        ['secret'],
        [],
        null,
        '',
        algoliaClient,
        'my-index',
        'api::article.article'
      );

      const savedObjects = createOrDeleteObjects.mock.calls[0][0];
      expect(savedObjects[0]).not.toHaveProperty('secret');
      expect(savedObjects[0]).toHaveProperty('objectID', '123');
    });

    test('continues processing remaining events after an error', async () => {
      getStrapiObject
        .mockRejectedValueOnce(new Error('Not found'))
        .mockResolvedValueOnce(fakeArticle);

      const events = [
        {
          result: {
            id: 1,
            documentId: 'bad-id',
            publishedAt: '2024-01-01',
          },
          model: { uid: 'api::article.article' },
          params: {},
        },
        {
          result: {
            id: 123,
            documentId: 'doc-id',
            publishedAt: '2024-01-01',
          },
          model: { uid: 'api::article.article' },
          params: {},
        },
      ];

      await strapiService({ strapi }).afterUpdateAndCreate(
        events as any,
        '*',
        [],
        [],
        null,
        '',
        algoliaClient,
        'my-index',
        'api::article.article'
      );

      const savedObjects = createOrDeleteObjects.mock.calls[0][0];
      expect(savedObjects).toHaveLength(1);
      expect(savedObjects[0].objectID).toBe('123');
    });
  });
});
