import { yup } from '@strapi/utils';

export const validateConfig = (config: unknown) => {
  try {
    yup
      .object()
      .shape({
        applicationId: yup.string().required(),
        apiKey: yup.string().required(),
        indexPrefix: yup.string().optional(),
        locales: yup
          .array()
          .of(yup.string().trim().isCamelCase().length(2))
          .optional(),
        contentTypes: yup
          .array()
          .of(
            yup.object().shape({
              name: yup.string().required(),
              index: yup.string().optional(),
              idPrefix: yup.string().optional(),
              // https://docs.strapi.io/dev-docs/api/entity-service/populate
              populate: yup.object().optional(),
              locales: yup
                .array()
                .of(yup.string().trim().isCamelCase().length(2))
                .optional(),
            })
          )
          .required(),
      })
      .validateSync(config);
  } catch (error) {
    throw new Error(
      `Algolia plugin configuration error: ${error.errors}`
    );
  }
};
