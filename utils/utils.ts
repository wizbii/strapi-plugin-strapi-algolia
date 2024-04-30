export const transformNullToBoolean = (
  obj: any,
  transformToBooleanFields: string[]
): any => {
  const newObj = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (obj[key] === null) {
      if (transformToBooleanFields.includes(key)) {
        newObj[key] = false;
      } else {
        newObj[key] = null;
      }
    } else if (typeof obj[key] === 'object') {
      newObj[key] = transformNullToBoolean(
        obj[key],
        transformToBooleanFields
      );
    } else {
      newObj[key] = obj[key];
    }
  }
  return newObj;
};
