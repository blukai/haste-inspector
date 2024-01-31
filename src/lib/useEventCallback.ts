import { useCallback, useLayoutEffect, useRef } from "react";

// https://github.com/facebook/react/issues/14099#issuecomment-440013892
export function useEventCallback<F extends (...args: any[]) => any>(fn: F) {
  const ref = useRef<F>(fn);
  useLayoutEffect(() => {
    ref.current = fn;
  });
  return useCallback(
    (...args: Parameters<F>): ReturnType<F> => ref.current.apply(null, args),
    [],
  );
}
