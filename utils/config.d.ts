export type StrapiAlgoliaConfig = {
  applicationId: string;
  apiKey: string;
  indexPrefix?: string;
  debug: boolean;
  contentTypes: {
    name: string;
    index: string;
    idPrefix?: string;
    populate: any;
  }[];
};
