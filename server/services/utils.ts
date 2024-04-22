import { Strapi } from '@strapi/strapi';
import { HookEvent } from '../../utils/event';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default ({ strapi }: { strapi: Strapi }) => ({
  filterProperties: (
    object: Record<string, any>,
    hiddenFields: string[]
  ) =>
    Object.keys(object).reduce((acc, key) => {
      if (hiddenFields.includes(key)) {
        return acc;
      }

      return { ...acc, [key]: object[key] };
    }, {}),
  getEntryId: (event: HookEvent) =>
    event?.result?.id ?? event?.params?.where?.id,
  getChunksRequests: (array: any[], chunkSize = 600) => {
    if (chunkSize <= 0) {
      throw new Error('chunkSize must be greater than 0');
    }

    const chunks: any[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }

    return chunks;
  },
});
