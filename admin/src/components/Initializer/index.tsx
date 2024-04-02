import { useEffect, useRef } from 'react';
import pluginId from '../../pluginId';

const Initializer = ({
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

export default Initializer;
