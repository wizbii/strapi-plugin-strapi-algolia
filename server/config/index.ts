import { validateConfig } from '../../utils/validate';

export default {
  default: {
    indexPrefix: `${strapi.config.environment}_`,
    locales: ['fr', 'en'],
  },
  validator: (config: unknown) => validateConfig(config),
};
