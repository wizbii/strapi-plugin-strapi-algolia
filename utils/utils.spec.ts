import { transformNullToBoolean } from './utils';

describe('Utils', () => {
  describe('transformNullToBoolean', () => {
    test('should transform null to false', () => {
      expect(
        transformNullToBoolean({ a: null, b: [3, 4] }, ['a'])
      ).toEqual({
        a: false,
        b: [3, 4],
      });
      expect(
        transformNullToBoolean(
          {
            a: { b: { c: null, d: null } },
            d: 'toto',
            e: 4,
          },
          ['c']
        )
      ).toEqual({
        a: { b: { c: false, d: null } },
        d: 'toto',
        e: 4,
      });
    });
  });
});
