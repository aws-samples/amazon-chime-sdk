import { useEffect, useRef } from 'react';

export default function useInterval(callback: Function, delay: number) {
  const savedCallback = useRef<Function>();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function nextTick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }
    const intervalId = setInterval(nextTick, delay);
    return () => clearInterval(intervalId);
  }, [delay]);
}
