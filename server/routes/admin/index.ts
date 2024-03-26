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
  ],
};
