import { validateConfig } from '../../utils/validate';

export default {
  default: {
    indexPrefix: strapi.config.environment + '_',
    debug: false,
  },
  validator: (config: unknown) => validateConfig(config),
};
