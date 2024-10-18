import { useRBAC } from '@strapi/strapi/admin';
import { useMatch } from 'react-router-dom';
import strapiAlgoliaPermissions from '../permissions';
import IndexAllButton from './IndexAllButton';

const ListViewInjectedComponent = () => {
  const routeMatch = useMatch('/content-manager/:kind/:slug?');
  const { allowedActions } = useRBAC(strapiAlgoliaPermissions);

  if (!allowedActions.canIndexAll) {
    return null;
  }

  return <IndexAllButton contentType={routeMatch?.params.slug} />;
};

export default ListViewInjectedComponent;
