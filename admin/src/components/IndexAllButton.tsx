import { Button } from '@strapi/design-system';
import { Play, WarningCircle } from '@strapi/icons';
import { useNotification } from '@strapi/strapi/admin';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useConfigContentTypes } from '../hooks';
import pluginId from '../pluginId';

import { Dialog } from '@strapi/design-system';
import { ConfirmDialog, useFetchClient } from '@strapi/strapi/admin';

export default ({ contentType }: { contentType?: string }) => {
  const { contentTypes } = useConfigContentTypes();
  const { post } = useFetchClient();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { formatMessage } = useIntl();
  const { toggleNotification } = useNotification();

  const abortController = new AbortController();
  const { signal } = abortController;

  useEffect(() => {
    return () => {
      abortController.abort();
    };
  }, []);

  const toggleConfirmModal = () =>
    setShowConfirmModal((prevState) => !prevState);

  const handleConfirmDelete = async () => {
    try {
      await post(
        `/${pluginId}/index-all-articles`,
        {
          name: contentType,
        },
        { signal }
      );

      toggleNotification({
        type: 'success',
        message: formatMessage({
          id: 'cache.purge.success',
          defaultMessage: 'All items have been indexed',
        }),
      });
    } catch (err) {
      const errorMessage = (err as any)?.response?.payload?.error
        ?.message;

      if (errorMessage) {
        toggleNotification({
          type: 'warning',
          message: formatMessage({
            id: 'cache.purge.error',
            defaultMessage: errorMessage,
          }),
        });
      } else {
        toggleNotification({
          type: 'warning',
          message: formatMessage({ id: 'notification.error' }),
        });
      }
    }
  };

  if (
    !contentTypes?.find(
      (configContentType) => configContentType === contentType
    )
  ) {
    return null;
  }

  return (
    <>
      <Button
        onClick={toggleConfirmModal}
        size="S"
        startIcon={<Play />}
        variant="default"
        type="button"
      >
        {formatMessage({
          id: 'cache.purge.delete-entry',
          defaultMessage: 'Index all items',
        })}
      </Button>
      <Dialog.Root
        open={showConfirmModal}
        onOpenChange={toggleConfirmModal}
      >
        <ConfirmDialog
          onConfirm={handleConfirmDelete}
          title={formatMessage({
            id: 'cache.purge.confirm-modal-title',
            defaultMessage: 'Confirm indexing all items?',
          })}
          variant="default"
          icon={<WarningCircle fill="danger500" />}
          children={formatMessage({
            id: 'cache.purge.confirm-modal-body',
            defaultMessage:
              'Are you sure you want to index all items this content type?',
          })}
        />
      </Dialog.Root>
    </>
  );
};
