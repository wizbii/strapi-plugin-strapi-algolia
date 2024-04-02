import { prefixPluginTranslations } from '@strapi/helper-plugin';
import pluginPkg from '../../package.json';
import Initializer from './components/Initializer';
import ListViewInjectedComponent from './components/ListViewInjectedComponent';
import pluginId from './pluginId';

const { name } = pluginPkg.strapi;

export default {
  register(app: any) {
    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: true,
      name,
    });
  },
  bootstrap(app: any) {
    app.injectContentManagerComponent('listView', 'actions', {
      name: 'ListViewInjectedComponent',
      Component: ListViewInjectedComponent,
    });
  },
  async registerTrads({ locales }: any) {
    const importedTranslations = await Promise.all(
      locales.map((locale: string) =>
        import(`./translations/${locale}.json`)
          .then(({ default: data }) => ({
            data: prefixPluginTranslations(data, pluginId),
            locale,
          }))
          .catch(() => ({
            data: {},
            locale,
          }))
      )
    );

    return Promise.resolve(importedTranslations);
  },
};
