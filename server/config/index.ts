import { validateConfig } from '../../utils/validate';

export default {
  default: {
    indexPrefix: `${strapi.config.environment}_`,
  },
  validator: (config: unknown) => validateConfig(config),
};
