import pluginPkg from '../../package.json';
import Initializer from './components/Initializer';
import ListViewInjectedComponent from './components/ListViewInjectedComponent';
import pluginId from './pluginId';

const { name } = pluginPkg.strapi;

type TradOptions = Record<string, string>;

const prefixPluginTranslations = (
  trad: TradOptions,
  pluginId: string
): TradOptions => {
  if (!pluginId) {
    throw new TypeError("pluginId can't be empty");
  }
  return Object.keys(trad).reduce<TradOptions>(
    (acc, current) => ({
      ...acc,
      [`${pluginId}.${current}`]: trad[current],
    }),
    {}
  );
};

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
    app
      .getPlugin('content-manager')
      .injectComponent('listView', 'actions', {
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

    return importedTranslations;
  },
};
