/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  useFetchClient,
  useNotification,
} from '@strapi/helper-plugin';
import { useEffect, useReducer, useRef } from 'react';
import pluginId from '../../pluginId';
import init from './init';
import reducer, { Actions, initialState } from './reducer';

const useConfigContentTypes = (shouldFetchData = true) => {
  const [{ contentTypes, isLoading }, dispatch] = useReducer(
    reducer,
    initialState,
    () => init(initialState, shouldFetchData)
  );
  const toggleNotification = useNotification();
  const client = useFetchClient();

  const isMounted = useRef(true);
  const abortController = new AbortController();
  const { signal } = abortController;

  useEffect(() => {
    if (shouldFetchData) {
      fetchConfigContentTypes();
    }

    return () => {
      abortController.abort();
      isMounted.current = false;
    };
  }, [shouldFetchData]);

  const fetchConfigContentTypes = async () => {
    try {
      dispatch({
        type: Actions.GET_DATA,
      });

      const { data } = await client.get(
        `/${pluginId}/config/content-types`,
        {
          method: 'GET',
          signal,
        }
      );

      dispatch({
        type: Actions.GET_DATA_SUCCEEDED,
        data: data.contentTypes,
      });
    } catch (err: any) {
      const message =
        err?.response?.payload?.message ?? 'An error occurred';

      if (isMounted.current) {
        dispatch({
          type: 'GET_DATA_ERROR',
        });

        if (message !== 'Forbidden') {
          toggleNotification({
            type: 'warning',
            message,
          });
        }
      }
    }
  };

  return {
    contentTypes,
    isLoading,
    getData: fetchConfigContentTypes,
  };
};

export default useConfigContentTypes;
