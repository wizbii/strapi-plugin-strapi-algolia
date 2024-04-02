import pluginId from './pluginId';

const pluginPermissions = {
  index: [
    {
      action: `plugin::${pluginId}.index.index-all`,
      subject: null,
    },
  ],
};

export default pluginPermissions;
