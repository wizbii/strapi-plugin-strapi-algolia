import utilsService from '../../server/src/services/utils';

describe('utils service', () => {
  test('getEntryId utils', () => {
    expect(
      utilsService({ strapi: {} as any }).getEntryId({} as any)
    ).toBeUndefined();
    expect(
      utilsService({ strapi: {} as any }).getEntryId({
        result: {
          documentId: 'idresult',
          id: 123,
        },
      } as any)
    ).toEqual(123);
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
