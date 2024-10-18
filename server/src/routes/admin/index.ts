export default {
  type: 'admin',
  routes: [
    {
      method: 'POST',
      path: '/index-all-articles',
      handler: 'strapi-algolia-index-articles.index',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
    {
      method: 'GET',
      path: '/config/content-types',
      handler: 'strapi-algolia-config.contentTypes',
      config: {
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
  ],
};
