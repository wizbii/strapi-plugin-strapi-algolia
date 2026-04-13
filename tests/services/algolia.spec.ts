import algoliaService from '../../server/src/services/algolia';

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
