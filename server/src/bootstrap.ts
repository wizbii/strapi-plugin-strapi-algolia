import type { Core } from '@strapi/strapi';
import { permissionsActions } from './permissions-actions';

export default async ({ strapi }: { strapi: Core.Strapi }) => {
  const strapiAlgolia = strapi.plugin('strapi-algolia');

  try {
    await strapi.admin?.services.permission.actionProvider.registerMany(
      permissionsActions
    );
  } catch (error) {
    strapi.log.error(
      `'strapi-algolia' permissions bootstrap failed. ${error.message}`
    );
  }

  try {
    await strapiAlgolia.service('lifecycles').loadLifecycleMethods();
  } catch (error) {
    strapi.log.error(
      `'strapi-algolia' plugin bootstrap lifecycles failed. ${error.message}`
    );
  }
};
