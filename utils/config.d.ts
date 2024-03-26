export type StrapiAlgoliaConfig = {
  applicationId: string;
  apiKey: string;
  indexPrefix?: string;
  locales?: string[];
  contentTypes: {
    name: string;
    index: string;
    idPrefix?: string;
    populate: any;
    locales?: string[];
  }[];
};
