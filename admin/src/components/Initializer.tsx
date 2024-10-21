import { useEffect, useRef } from 'react';
import pluginId from '../pluginId';

export default ({
  setPlugin,
}: {
  setPlugin: (id: string) => void;
}) => {
  const ref = useRef(setPlugin);

  useEffect(() => {
    ref.current(pluginId);
  }, []);

  return null;
};
