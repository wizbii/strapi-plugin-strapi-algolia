import { transformNullToBoolean } from './utils';

describe('Utils', () => {
  describe('transformNullToBoolean', () => {
    test('should transform null to false', () => {
      expect(transformNullToBoolean({ a: null }, ['a'])).toEqual({
        a: false,
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
