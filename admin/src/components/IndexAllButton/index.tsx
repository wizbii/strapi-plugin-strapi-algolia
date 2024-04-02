import { Button } from '@strapi/design-system/Button';
import {
  ConfirmDialog,
  useFetchClient,
  useNotification,
} from '@strapi/helper-plugin';
import Play from '@strapi/icons/Play';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useConfigContentTypes } from '../../hooks';
import pluginId from '../../pluginId';

const IndexAllButton = ({ contentType }: { contentType: string }) => {
  const { contentTypes } = useConfigContentTypes();
  const { post } = useFetchClient();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [
    isModalConfirmButtonLoading,
    setIsModalConfirmButtonLoading,
  ] = useState(false);
  const { formatMessage } = useIntl();
  const toggleNotification = useNotification();

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
      // Show the loading state
      setIsModalConfirmButtonLoading(true);

      await post(`/${pluginId}/index-all-articles`, {
        method: 'POST',
        signal,
        body: {
          name: contentType as any,
        } as any,
      });

      toggleNotification({
        type: 'success',
        message: {
          id: 'cache.purge.success',
          defaultMessage: 'All items have been indexed',
        },
      });

      setIsModalConfirmButtonLoading(false);

      toggleConfirmModal();
    } catch (err) {
      const errorMessage = (err as any)?.response?.payload?.error
        ?.message;
      setIsModalConfirmButtonLoading(false);
      toggleConfirmModal();

      if (errorMessage) {
        toggleNotification({
          type: 'warning',
          message: {
            id: 'cache.purge.error',
            defaultMessage: errorMessage,
          },
        });
      } else {
        toggleNotification({
          type: 'warning',
          message: { id: 'notification.error' },
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
      >
        {formatMessage({
          id: 'cache.purge.delete-entry',
          defaultMessage: 'Index all items',
        })}
      </Button>
      <ConfirmDialog
        isConfirmButtonLoading={isModalConfirmButtonLoading}
        isOpen={showConfirmModal}
        onConfirm={handleConfirmDelete}
        onToggleDialog={toggleConfirmModal}
        title={{
          id: 'cache.purge.confirm-modal-title',
          defaultMessage: 'Confirm indexing all items?',
        }}
        bodyText={{
          id: 'cache.purge.confirm-modal-body',
          defaultMessage:
            'Are you sure you want to index all items this content type?',
        }}
        iconRightButton={<Play />}
        rightButtonText={{
          id: 'cache.purge.confirm-modal-confirm',
          defaultMessage: 'Index all items',
        }}
      />
    </>
  );
};

export default IndexAllButton;
