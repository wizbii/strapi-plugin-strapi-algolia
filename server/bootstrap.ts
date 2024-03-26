import { Strapi } from '@strapi/strapi';

export default async ({ strapi }: { strapi: Strapi }) => {
  const strapiAlgolia = strapi.plugin('strapi-algolia');

  try {
    await strapiAlgolia.service('lifecycles').loadLifecycleMethods();
  } catch (error) {
    strapi.log.error(
      `'strapi-algolia' plugin bootstrap lifecycles failed. ${error.message}`
    );
  }
};
