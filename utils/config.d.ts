export type StrapiAlgoliaConfig = {
  applicationId: string;
  apiKey: string;
  indexPrefix?: string;
  contentTypes: {
    name: string;
    index: string;
    idPrefix?: string;
    populate: any;
    hideFields?: string[];
    transformToBooleanFields?: string[];
  }[];
  transformerCallback?: (string, any) => any | null
};
