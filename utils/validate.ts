import { yup } from '@strapi/utils';

export const validateConfig = (config: unknown) => {
  try {
    yup
      .object()
      .shape({
        applicationId: yup.string().required(),
        apiKey: yup.string().required(),
        indexPrefix: yup.string(),
        contentTypes: yup.array().of(
          yup.object().shape({
            name: yup.string().required(),
            index: yup.string(),
            idPrefix: yup.string(),
            // https://docs.strapi.io/dev-docs/api/entity-service/populate
            populate: yup.object(),
            hideFields: yup.array().of(yup.string()),
          })
        ),
      })
      .validateSync(config);
  } catch (error) {
    throw new Error(
      `Algolia plugin configuration error: ${error.errors}`
    );
  }
};
